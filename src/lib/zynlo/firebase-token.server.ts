import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { importPKCS8, SignJWT } from "jose";

import account from "./firebase-adminsdk.server.json" with { type: "json" };

const serviceAccount = account as {
  client_email: string;
  private_key: string;
};

let cache: { token: string; exp: number } | null = null;

export async function getFirebaseAccessToken(): Promise<string> {
  if (cache && cache.exp > Date.now() + 60_000) return cache.token;
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
    throw new Error(`Firebase auth failed (${res.status})`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cache = {
    token: json.access_token,
    exp: Date.now() + Math.max(60, json.expires_in) * 1000,
  };
  return json.access_token;
}

const macKey = createHash("sha256").update(serviceAccount.private_key).digest();

export function sealAgentSession(agentId: string, exp: number): string {
  const body = `${agentId}.${exp}`;
  const sig = createHmac("sha256", macKey).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function openAgentSession(value: string | undefined | null): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length < 3) return null;
  const sig = parts.pop() as string;
  const exp = Number(parts.pop());
  const agentId = parts.join(".");
  if (!agentId || !Number.isFinite(exp) || exp < Date.now()) return null;
  const expected = createHmac("sha256", macKey)
    .update(`${agentId}.${exp}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return agentId;
}
