import { getRequest } from "@tanstack/react-start/server";
import {
  accessAgentId,
  canonicalEmail,
  nameFromEmail,
  parseAdminEmails,
  planAgentLink,
} from "./agent-identity.ts";
import { verifiedAccessEmail } from "./access.server.ts";
import { ClientSafeError } from "./client-error.ts";
import {
  firebaseCreateAccessAgent,
  firebaseListAgents,
  firebasePatchAgent,
} from "./firebase.ts";
import type { Agent } from "./types.ts";

export type AccessPrincipal = { id: string; email: string; name: string };

async function adminEmails(): Promise<Set<string>> {
  let raw = process.env.ADMIN_EMAILS;
  try {
    const { env } = await import("cloudflare:workers");
    if (env.ADMIN_EMAILS) raw = env.ADMIN_EMAILS;
  } catch {
    /* unit tests and non-Worker runtimes */
  }
  return parseAdminEmails(raw);
}

/**
 * Resolves the CRM agent for the verified Access email.
 * May PATCH a blank email, set role Admin for ADMIN_EMAILS, or INSERT one
 * new agent. Does not delete rows or change password hashes.
 */
export async function resolveAgentForEmail(email: string): Promise<Agent> {
  const canonical = canonicalEmail(email);
  if (!canonical) throw new ClientSafeError("Sign in required");
  const admin = (await adminEmails()).has(canonical);
  const role = admin ? "Admin" : undefined;
  const agents = await firebaseListAgents();
  const plan = planAgentLink(agents, canonical);
  if (plan.kind === "email" || plan.kind === "backfill") {
    const found = agents.find((agent) => agent.id === plan.id);
    if (!found) throw new ClientSafeError("Sign in required");
    const patch: { email?: string; role?: string } = {};
    if (plan.kind === "backfill") patch.email = canonical;
    if (role && found.role !== role) patch.role = role;
    if (patch.email || patch.role) await firebasePatchAgent(found.id, patch);
    return {
      ...found,
      email: patch.email ?? found.email,
      role: patch.role ?? found.role,
    };
  }

  const id = await accessAgentId(canonical);
  const clash = agents.find((agent) => agent.id === id);
  if (clash) {
    if (canonicalEmail(clash.email ?? "") !== canonical) {
      throw new ClientSafeError("Something went wrong. Try again.");
    }
    if (role && clash.role !== role) {
      await firebasePatchAgent(clash.id, { role });
      return { ...clash, role };
    }
    return clash;
  }
  const created = await firebaseCreateAccessAgent({
    id,
    name: nameFromEmail(canonical),
    email: canonical,
    role: role ?? "Agent",
  });
  if (role && created.role !== role) {
    await firebasePatchAgent(created.id, { role });
    return { ...created, role };
  }
  return created;
}

export async function requireAccessAgent(): Promise<AccessPrincipal> {
  const request = getRequest();
  if (!request) throw new ClientSafeError("Sign in required");
  const email = await verifiedAccessEmail(request);
  const agent = await resolveAgentForEmail(email);
  return { id: agent.id, email: canonicalEmail(agent.email) || email, name: agent.name };
}
