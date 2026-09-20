const PEPPER = "zynlo.gate.v1";
const SESSION_KEY = "zynlo.session.v1";

export type AgentSession = { agentId: string; proof: string };

export async function hashAgentPassword(agentId: string, password: string) {
  const raw = `${PEPPER}|${agentId}|${password.trim()}`;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function readAgentSession(): AgentSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AgentSession;
    if (!parsed?.agentId || !parsed?.proof) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAgentSession(agentId: string, proof: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ agentId, proof }));
  } catch {
    /* ignore quota */
  }
}

export function clearAgentSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
