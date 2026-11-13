/**
 * Maps a verified Cloudflare Access email to a CRM agent.
 *
 * 1. Case-insensitive email match wins. Existing rows are not modified.
 *    If several rows share that email, the lowest id is used.
 * 2. Otherwise, if exactly one agent has a blank email AND its name compacts
 *    to the same letters and digits as the email local-part, that row's email
 *    field is filled in. Any other shape (including "Susika" vs "susika.vs")
 *    is treated as ambiguous and is left untouched.
 * 3. Otherwise a new minimal agent is created. The original records stay as they are.
 */
export type AgentLinkInput = {
  id: string;
  name: string;
  email?: string;
};

export type AgentLinkPlan =
  | { kind: "email"; id: string }
  | { kind: "backfill"; id: string }
  | { kind: "create" };

export const ALLOWED_AGENT_EMAILS = [
  "susika.vs@gmail.com",
  "edirisinghayashodha@gmail.com",
  "sivakumarpraveena804@gmail.com",
  "iamharshika.7@gmail.com",
] as const;

export function canonicalEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  return email;
}

export function isAllowedAgentEmail(email: string): boolean {
  return (ALLOWED_AGENT_EMAILS as readonly string[]).includes(email);
}

export function compactIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  const titled = words.replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
  return (titled || "Agent").slice(0, 80);
}

export function planAgentLink(
  agents: AgentLinkInput[],
  email: string,
): AgentLinkPlan {
  const wanted = canonicalEmail(email) ?? email.trim().toLowerCase();
  const byEmail = agents
    .filter((agent) => canonicalEmail(agent.email ?? "") === wanted)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (byEmail.length > 0) return { kind: "email", id: byEmail[0].id };

  const local = compactIdentity(wanted.split("@")[0] ?? "");
  if (!local) return { kind: "create" };
  const blank = agents.filter((agent) => {
    if ((agent.email ?? "").trim()) return false;
    const name = compactIdentity(agent.name ?? "");
    return name.length > 0 && name === local;
  });
  if (blank.length === 1) return { kind: "backfill", id: blank[0].id };
  return { kind: "create" };
}

export async function accessAgentId(email: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`zynlo-access-agent:${email}`),
  );
  const hex = [...new Uint8Array(digest).slice(0, 16)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `acc${hex}`;
}
