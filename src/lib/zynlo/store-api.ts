/**
 * REST helpers for /api/zynlo — same Firebase shared workspace as server fns.
 */
import {
  firebaseDeleteAgent,
  firebaseDeleteCall,
  firebaseDeleteClient,
  firebaseDeleteCustomer,
  firebaseDeleteMessage,
  firebaseLoadAll,
  firebaseMergeCustomers,
  firebaseUpsertAgent,
  firebaseUpsertCall,
  firebaseUpsertClient,
  firebaseUpsertCustomer,
  firebaseUpsertMessage,
} from "./firebase";
import type { ZynloData } from "./types";

export async function loadAll(): Promise<ZynloData> {
  return firebaseLoadAll();
}

export async function upsertAgent(body: Record<string, unknown>) {
  return firebaseUpsertAgent({
    id: body.id ? String(body.id) : undefined,
    name: String(body.name || ""),
    email: body.email != null ? String(body.email) : undefined,
    role: body.role != null ? String(body.role) : undefined,
    status: body.status != null ? String(body.status) : undefined,
    passwordHash:
      body.passwordHash != null ? String(body.passwordHash) : undefined,
  });
}

export async function removeAgent(id: string) {
  await firebaseDeleteAgent(id);
}

export async function upsertCustomer(body: Record<string, unknown>) {
  return firebaseUpsertCustomer({
    id: body.id ? String(body.id) : undefined,
    name: String(body.name || ""),
    phone: String(body.phone || ""),
    email: body.email != null ? String(body.email) : undefined,
    company: body.company != null ? String(body.company) : undefined,
    clientId: body.clientId ? String(body.clientId) : null,
    notes: "",
  });
}

export async function removeCustomer(id: string) {
  await firebaseDeleteCustomer(id);
}

export async function upsertClient(body: Record<string, unknown>) {
  return firebaseUpsertClient({
    id: body.id ? String(body.id) : undefined,
    name: String(body.name || ""),
    industry: body.industry != null ? String(body.industry) : undefined,
    phone: body.phone != null ? String(body.phone) : undefined,
    email: body.email != null ? String(body.email) : undefined,
    website: body.website != null ? String(body.website) : undefined,
    status: body.status != null ? String(body.status) : undefined,
    address: body.address != null ? String(body.address) : undefined,
    notes: body.notes != null ? String(body.notes) : undefined,
  });
}

export async function removeClient(id: string) {
  await firebaseDeleteClient(id);
}

export async function upsertCall(body: Record<string, unknown>) {
  return firebaseUpsertCall({
    id: body.id ? String(body.id) : undefined,
    datetime: String(body.datetime || ""),
    agentId: String(body.agentId || ""),
    customerId: String(body.customerId || ""),
    clientId: body.clientId ? String(body.clientId) : null,
    type: body.type != null ? String(body.type) : undefined,
    duration: Number(body.duration) || 0,
    outcome: String(body.outcome || "Resolved"),
    rating:
      body.rating == null || body.rating === ""
        ? null
        : Number(body.rating),
    notes: body.notes != null ? String(body.notes) : undefined,
    followUpAt: body.followUpAt ? String(body.followUpAt).slice(0, 10) : null,
  });
}

export async function removeCall(id: string) {
  await firebaseDeleteCall(id);
}

export async function upsertMessage(body: Record<string, unknown>) {
  return firebaseUpsertMessage({
    id: body.id ? String(body.id) : undefined,
    datetime: String(body.datetime || ""),
    agentId: String(body.agentId || ""),
    customerId: String(body.customerId || ""),
    clientId: body.clientId ? String(body.clientId) : null,
    channel: body.channel != null ? String(body.channel) : undefined,
    direction: body.direction != null ? String(body.direction) : undefined,
    subject: body.subject != null ? String(body.subject) : undefined,
    body: String(body.body || ""),
    status: body.status != null ? String(body.status) : undefined,
    notes: body.notes != null ? String(body.notes) : undefined,
    followUpAt: body.followUpAt ? String(body.followUpAt).slice(0, 10) : null,
  });
}

export async function removeMessage(id: string) {
  await firebaseDeleteMessage(id);
}

export async function mergeCustomers(keepId: string, dropId: string) {
  await firebaseMergeCustomers(keepId, dropId);
}
