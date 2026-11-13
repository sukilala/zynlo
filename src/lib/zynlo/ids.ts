import { ClientSafeError } from "./client-error.ts";

const RESERVED = new Set(["__proto__", "constructor", "prototype"]);
const ID_RE = /^[A-Za-z0-9_-]{6,80}$/;

/** Firebase RTDB keys used as path segments. Rejects `.`, `$`, `#`, `/`, and other path syntax. */
export function isSafeRecordId(id: string): boolean {
  return ID_RE.test(id) && !RESERVED.has(id) && !id.startsWith("__");
}

export function assertRecordId(id: string): void {
  if (!isSafeRecordId(id)) throw new ClientSafeError("Invalid record id");
}
