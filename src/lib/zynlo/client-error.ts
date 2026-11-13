/** Errors whose message is safe to show in the CRM UI. */
export class ClientSafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientSafeError";
  }
}

/** Replace unexpected failures so Firebase bodies, paths, and stacks stay on the server. */
export function toClientError(err: unknown): Error {
  if (err instanceof ClientSafeError) return err;
  console.error(
    "[zynlo] request failed",
    err instanceof Error ? err.name : "error",
  );
  return new ClientSafeError("Something went wrong. Try again.");
}
