import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { ClientSafeError } from "./client-error.ts";
import { canonicalEmail, isAllowedAgentEmail } from "./agent-identity.ts";

export type AccessSettings = {
  teamDomain?: string;
  aud?: string;
  devEmail?: string;
};

type AccessConfig = { issuer: string; audience: string; certsUrl: string };

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/** Same 30s slack jwtVerify uses. A cached pass is not reused past that. */
const ACCESS_SKEW_MS = 30_000;

type VerifiedAccess = { email: string; expMs: number };

const verifiedAccess = new Map<string, VerifiedAccess>();
const verifyFlights = new Map<string, Promise<string>>();

function accessCacheKey(token: string, config: AccessConfig): string {
  const signature = token.slice(token.lastIndexOf(".") + 1);
  return `${config.issuer}\n${config.audience}\n${signature}`;
}

function readVerifiedAccess(key: string): string | null {
  const hit = verifiedAccess.get(key);
  if (!hit) return null;
  if (hit.expMs - ACCESS_SKEW_MS <= Date.now()) {
    verifiedAccess.delete(key);
    return null;
  }
  return hit.email;
}

export function isLocalDevRequest(request: Request): boolean {
  try {
    if (import.meta.env?.DEV) return true;
  } catch {
    /* node test runner */
  }
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    return true;
  }
  try {
    const host = new URL(request.url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  } catch {
    return false;
  }
}

export function resolveAccessConfig(settings: AccessSettings): AccessConfig | null {
  const domain = settings.teamDomain?.trim() ?? "";
  const audience = settings.aud?.trim() ?? "";
  if (!domain || !audience) return null;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const issuer = `https://${host}`;
  return { issuer, audience, certsUrl: `${issuer}/cdn-cgi/access/certs` };
}

function jwksFor(certsUrl: string) {
  let cached = jwksCache.get(certsUrl);
  if (!cached) {
    cached = createRemoteJWKSet(new URL(certsUrl), {
      cacheMaxAge: 600_000,
      cooldownDuration: 30_000,
      timeoutDuration: 5_000,
    });
    jwksCache.set(certsUrl, cached);
  }
  return cached;
}

export function readAccessToken(request: Request): string | null {
  const header = request.headers.get("cf-access-jwt-assertion")?.trim();
  if (header) return header;
  const cookies = request.headers.get("cookie");
  if (!cookies) return null;
  for (const part of cookies.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== "CF_Authorization") continue;
    const value = trimmed.slice(eq + 1).trim();
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

async function verifyAccessJwt(
  token: string,
  config: AccessConfig,
  getKey: JWTVerifyGetKey | undefined,
  cacheKey: string,
): Promise<string> {
  let email: string | null = null;
  let expMs = 0;
  try {
    const { payload } = await jwtVerify(token, getKey ?? jwksFor(config.certsUrl), {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ["RS256"],
      clockTolerance: 30,
    });
    email = typeof payload.email === "string" ? canonicalEmail(payload.email) : null;
    expMs = typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch (err) {
    console.error("[zynlo] access jwt rejected", err instanceof Error ? err.name : "error");
    throw new ClientSafeError("Sign in required");
  }
  if (!email) throw new ClientSafeError("Sign in required");
  if (!isAllowedAgentEmail(email)) {
    console.error("[zynlo] access email is not on the roster");
    throw new ClientSafeError("This account is not on the Zynlo roster.");
  }
  if (expMs > Date.now()) {
    if (verifiedAccess.size >= 32) {
      const oldest = verifiedAccess.keys().next().value;
      if (oldest) verifiedAccess.delete(oldest);
    }
    verifiedAccess.set(cacheKey, { email, expMs });
  }
  return email;
}

export async function emailFromAccessJwt(
  token: string,
  config: AccessConfig,
  getKey?: JWTVerifyGetKey,
): Promise<string> {
  const cacheKey = accessCacheKey(token, config);
  const cached = readVerifiedAccess(cacheKey);
  if (cached) return cached;
  const inflight = verifyFlights.get(cacheKey);
  if (inflight) return inflight;
  const pending = verifyAccessJwt(token, config, getKey, cacheKey).finally(() => {
    if (verifyFlights.get(cacheKey) === pending) verifyFlights.delete(cacheKey);
  });
  verifyFlights.set(cacheKey, pending);
  return pending;
}

export async function readAccessSettings(): Promise<AccessSettings> {
  const settings: AccessSettings = {
    teamDomain: process.env.ACCESS_TEAM_DOMAIN,
    aud: process.env.ACCESS_AUD,
    devEmail: process.env.DEV_AGENT_EMAIL,
  };
  try {
    const { env } = await import("cloudflare:workers");
    if (env.ACCESS_TEAM_DOMAIN) settings.teamDomain = env.ACCESS_TEAM_DOMAIN;
    if (env.ACCESS_AUD) settings.aud = env.ACCESS_AUD;
    if (env.DEV_AGENT_EMAIL) settings.devEmail = env.DEV_AGENT_EMAIL;
  } catch {
    /* vite dev alias or unit tests */
  }
  return settings;
}

/**
 * Email of the signed-in agent, or a ClientSafeError.
 * Access vars set → JWT required (including local wrangler).
 * Access vars unset → allow DEV_AGENT_EMAIL only for a local dev request.
 * Production without Access vars fails closed.
 */
export async function verifiedAccessEmail(
  request: Request,
  settings?: AccessSettings,
): Promise<string> {
  const resolved = settings ?? (await readAccessSettings());
  const access = resolveAccessConfig(resolved);
  if (!access) {
    if (!isLocalDevRequest(request)) {
      console.error("[zynlo] access config missing");
      throw new ClientSafeError("Sign in required");
    }
    const devEmail = canonicalEmail(resolved.devEmail ?? "");
    if (!devEmail || !isAllowedAgentEmail(devEmail)) {
      console.error("[zynlo] dev agent email missing");
      throw new ClientSafeError("Sign in required");
    }
    return devEmail;
  }
  const token = readAccessToken(request);
  if (!token) {
    console.error("[zynlo] access jwt missing");
    throw new ClientSafeError("Sign in required");
  }
  return emailFromAccessJwt(token, access);
}

export function accessDeniedResponse(): Response {
  return new Response("Forbidden", {
    status: 403,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
