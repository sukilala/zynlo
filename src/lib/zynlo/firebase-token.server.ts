import { importPKCS8, SignJWT } from "jose";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

let accountPromise: Promise<ServiceAccount> | null = null;

function readProcessEnv(): string | undefined {
  const value =
    typeof process !== "undefined"
      ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      : undefined;
  return value && value.trim() ? value : undefined;
}

async function readCloudflareEnv(): Promise<string | undefined> {
  try {
    const { env } = await import("cloudflare:workers");
    const value = env?.FIREBASE_SERVICE_ACCOUNT_JSON;
    return value && value.trim() ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Local `vite dev` fallback. Dead-code-eliminated from the production Worker
 * bundle (`import.meta.env.DEV` is false), so the gitignored key file is never
 * a build dependency and is never shipped.
 */
async function readDevFile(): Promise<string | undefined> {
  if (!import.meta.env.DEV) return undefined;
  try {
    const fs = await import("node:fs");
    const url = new URL("./firebase-adminsdk.server.json", import.meta.url);
    return fs.readFileSync(url, "utf8");
  } catch {
    return undefined;
  }
}

function parseServiceAccount(raw: string): ServiceAccount {
  let parsed: unknown = JSON.parse(raw);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object");
  }
  const account = parsed as ServiceAccount;
  if (!account.client_email || !account.private_key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is missing client_email or private_key",
    );
  }
  account.private_key = account.private_key.replace(/\\n/g, "\n");
  return account;
}

async function loadServiceAccount(): Promise<ServiceAccount> {
  if (!accountPromise) {
    accountPromise = (async () => {
      const raw =
        readProcessEnv() ||
        (await readCloudflareEnv()) ||
        (await readDevFile());
      if (!raw) {
        throw new Error(
          "Firebase credentials missing. Set the FIREBASE_SERVICE_ACCOUNT_JSON secret (full service-account JSON).",
        );
      }
      return parseServiceAccount(raw);
    })().catch((err) => {
      accountPromise = null;
      throw err;
    });
  }
  return accountPromise;
}

let cache: { token: string; exp: number } | null = null;

export async function getFirebaseAccessToken(): Promise<string> {
  if (cache && cache.exp > Date.now() + 60_000) return cache.token;
  const serviceAccount = await loadServiceAccount();
  const key = await importPKCS8(serviceAccount.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({
    scope:
      "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    console.error(`[zynlo] firebase auth failed (${res.status})`);
    throw new Error("workspace");
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cache = {
    token: json.access_token,
    exp: Date.now() + Math.max(60, json.expires_in) * 1000,
  };
  return json.access_token;
}
