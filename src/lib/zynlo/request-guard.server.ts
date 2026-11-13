import { getRequest } from "@tanstack/react-start/server";
import { ClientSafeError } from "./client-error";

/** Browser calls from this app set the header. Cross-site forms cannot. */
export function assertAppRequest(): void {
  const request = getRequest();
  if (!request) throw new ClientSafeError("Forbidden");
  if (request.headers.get("x-zynlo-request") !== "crm") {
    throw new ClientSafeError("Forbidden");
  }
}
