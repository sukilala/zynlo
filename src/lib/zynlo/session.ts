const LEGACY_KEY = "zynlo.session.v1";

/** Drop the old password proof if a browser still has it. Sign-in is Cloudflare Access. */
export function clearLegacyAgentSession() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
