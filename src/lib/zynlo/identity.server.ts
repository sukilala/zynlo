import { getRequest } from "@tanstack/react-start/server";
import {
  accessAgentId,
  canonicalEmail,
  nameFromEmail,
  planAgentLink,
} from "./agent-identity";
import { verifiedAccessEmail } from "./access.server";
import { ClientSafeError } from "./client-error";
import {
  firebaseCreateAccessAgent,
  firebaseListAgents,
  firebaseSetAgentEmail,
} from "./firebase";
import type { Agent } from "./types";

export type AccessPrincipal = { id: string; email: string; name: string };

/**
 * Resolves the CRM agent for the verified Access email.
 * May PATCH one blank email, or INSERT one new agent. Never deletes or
 * rewrites an existing agent's other fields.
 */
export async function resolveAgentForEmail(email: string): Promise<Agent> {
  const canonical = canonicalEmail(email);
  if (!canonical) throw new ClientSafeError("Sign in required");
  const agents = await firebaseListAgents();
  const plan = planAgentLink(agents, canonical);
  if (plan.kind === "email" || plan.kind === "backfill") {
    const found = agents.find((agent) => agent.id === plan.id);
    if (!found) throw new ClientSafeError("Sign in required");
    if (plan.kind === "backfill") {
      await firebaseSetAgentEmail(found.id, canonical);
      return { ...found, email: canonical };
    }
    return found;
  }

  const id = await accessAgentId(canonical);
  const clash = agents.find((agent) => agent.id === id);
  if (clash) {
    if (canonicalEmail(clash.email ?? "") === canonical) return clash;
    throw new ClientSafeError("Something went wrong. Try again.");
  }
  return firebaseCreateAccessAgent({
    id,
    name: nameFromEmail(canonical),
    email: canonical,
  });
}

export async function requireAccessAgent(): Promise<AccessPrincipal> {
  const request = getRequest();
  if (!request) throw new ClientSafeError("Sign in required");
  const email = await verifiedAccessEmail(request);
  const agent = await resolveAgentForEmail(email);
  return { id: agent.id, email: canonicalEmail(agent.email) || email, name: agent.name };
}
