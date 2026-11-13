/**
 * Shared Zynlo workspace on Firebase Realtime Database.
 * Reads are one page per request. Writes touch a single record.
 */
import { ClientSafeError } from "./client-error";
import { assertRecordId } from "./ids";
import {
  mapAgent,
  mapCall,
  mapClient,
  mapCustomer,
  mapMessage,
  MERGE_BATCH,
  pageFromRaw,
  parseStoredQa,
  RTDB_PAGE_SIZE,
  rtdbPageQuery,
  type CollectionName,
  type DataPage,
} from "./records";
import { singleFlight } from "./single-flight";
import type { Agent, Call, Client, Customer, Message, QaParts } from "./types";

const RTDB_ROOT = "https://zynlo-crm-default-rtdb.firebaseio.com";

/** Uncompressed page body. Larger than this is cancelled before JSON.parse. */
const MAX_PAGE_BYTES = 256 * 1024;

const AGENT_TTL_MS = 60_000;

function uid() {
  return crypto.randomUUID();
}

class PageTooLargeError extends Error {
  declared: number;
  constructor(declared = 0) {
    super("page");
    this.name = "PageTooLargeError";
    this.declared = declared;
  }
}

async function authedHeaders(base: Record<string, string>): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    throw new ClientSafeError("Something went wrong. Try again.");
  }
  const { getFirebaseAccessToken } = await import("./firebase-token.server");
  const token = await getFirebaseAccessToken();
  return { ...base, Authorization: `Bearer ${token}` };
}

async function firebaseFetch(pathAndQuery: string, init?: RequestInit): Promise<Response> {
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  const res = await fetch(`${RTDB_ROOT}${path}`, {
    ...init,
    headers: await authedHeaders({
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    await res.body?.cancel();
    console.error(`[zynlo] firebase ${init?.method || "GET"} failed (${res.status})`);
    throw new ClientSafeError("Something went wrong. Try again.");
  }
  return res;
}

async function readBounded(res: Response, maxBytes: number): Promise<string> {
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > maxBytes) {
    await res.body?.cancel();
    throw new PageTooLargeError(declared);
  }
  if (!res.body) {
    const text = await res.text();
    if (text.length > maxBytes) throw new PageTooLargeError(text.length);
    return text;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new PageTooLargeError(received);
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(buf);
}

async function rtdbFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await firebaseFetch(path, init);
  if ((init?.method || "GET").toUpperCase() === "DELETE") {
    await res.body?.cancel();
    return null as T;
  }
  const text = await res.text();
  if (!text || text === "null") return null as T;
  return JSON.parse(text) as T;
}

async function readPageLimit(
  collection: CollectionName,
  cursor: string | null,
  limit: number,
): Promise<DataPage> {
  const query = rtdbPageQuery(cursor, limit);
  const res = await firebaseFetch(`/${collection}.json?${query}`);
  const text = await readBounded(res, MAX_PAGE_BYTES);
  const raw = !text || text === "null" ? null : JSON.parse(text);
  return pageFromRaw(collection, raw, cursor, limit);
}

export async function firebaseReadPage(
  collection: CollectionName,
  cursor: string | null,
): Promise<DataPage> {
  let limit = RTDB_PAGE_SIZE;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await readPageLimit(collection, cursor, limit);
    } catch (err) {
      if (!(err instanceof PageTooLargeError)) throw err;
      const farTooBig = err.declared > MAX_PAGE_BYTES * 4;
      if (farTooBig || limit <= 8) {
        console.error("[zynlo] firebase page too large");
        throw new ClientSafeError("Something went wrong. Try again.");
      }
      limit = Math.max(8, Math.floor(limit / 2));
    }
  }
  console.error("[zynlo] firebase page too large");
  throw new ClientSafeError("Something went wrong. Try again.");
}

let agentCache: { at: number; agents: Agent[] } | null = null;
let agentGen = 0;
const agentSlot: { current: Promise<Agent[]> | null } = { current: null };

function invalidateAgentCache() {
  agentCache = null;
  agentGen += 1;
}

export async function firebaseListAgents(): Promise<Agent[]> {
  if (agentCache && Date.now() - agentCache.at < AGENT_TTL_MS) return agentCache.agents;
  return singleFlight(agentSlot, async () => {
    if (agentCache && Date.now() - agentCache.at < AGENT_TTL_MS) {
      return agentCache.agents;
    }
    const gen = agentGen;
    const agents: Agent[] = [];
    let cursor: string | null = null;
    for (let i = 0; i < 20; i++) {
      const page = await firebaseReadPage("agents", cursor);
      if (page.collection !== "agents") break;
      agents.push(...page.items);
      if (!page.nextCursor) {
        if (gen === agentGen) agentCache = { at: Date.now(), agents };
        return agents;
      }
      cursor = page.nextCursor;
    }
    throw new ClientSafeError("Something went wrong. Try again.");
  });
}

/** One-time (per process) convert array collections → maps by id. */
export async function ensureFirebaseMaps(): Promise<void> {
  // Never rewrite a whole collection. That path used to PUT /calls.json
  // and could wipe saved calls.
}

async function putItem(
  collection: CollectionName,
  id: string,
  row: Record<string, unknown>,
): Promise<void> {
  assertRecordId(id);
  if (collection === "agents") invalidateAgentCache();
  const payload = { ...row, id, updatedAt: new Date().toISOString() };
  const path = `/${collection}/${encodeURIComponent(id)}.json`;
  const saved = await rtdbFetch<Record<string, unknown> | null>(path, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!saved || typeof saved !== "object") {
    throw new ClientSafeError("Save did not persist.");
  }
}

async function deleteItem(collection: CollectionName, id: string): Promise<void> {
  assertRecordId(id);
  if (collection === "agents") invalidateAgentCache();
  await rtdbFetch(`/${collection}/${encodeURIComponent(id)}.json`, {
    method: "DELETE",
  });
}

export async function firebaseUpsertAgent(input: {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
}): Promise<Agent> {
  const name = input.name.trim();
  if (!name) throw new ClientSafeError("Name is required");
  const id = input.id || uid();
  let prev: Record<string, unknown> | null = null;
  if (input.id) {
    prev = await rtdbFetch<Record<string, unknown> | null>(
      `/agents/${encodeURIComponent(id)}.json`,
    );
  }
  // Keep any existing password hash byte-for-byte. Access is the login.
  const passwordHash =
    prev && typeof prev.passwordHash === "string" && prev.passwordHash
      ? prev.passwordHash
      : undefined;
  const row = {
    id,
    name,
    email: (input.email || "").trim(),
    role: input.role || "Agent",
    status: input.status || "Active",
    ...(passwordHash ? { passwordHash } : {}),
  };
  await putItem("agents", id, row);
  return mapAgent(row);
}

/** Patches email and/or role. Password hashes and other fields stay put. */
export async function firebasePatchAgent(
  id: string,
  patch: { email?: string; role?: string },
): Promise<void> {
  assertRecordId(id);
  const body: Record<string, string> = {};
  if (patch.email) body.email = patch.email;
  if (patch.role) body.role = patch.role;
  if (Object.keys(body).length === 0) return;
  invalidateAgentCache();
  await rtdbFetch(`/agents/${encodeURIComponent(id)}.json`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** Inserts a new Access agent. Refuses to overwrite a row that is already there. */
export async function firebaseCreateAccessAgent(input: {
  id: string;
  name: string;
  email: string;
  role?: string;
}): Promise<Agent> {
  assertRecordId(input.id);
  const existing = await rtdbFetch<Record<string, unknown> | null>(
    `/agents/${encodeURIComponent(input.id)}.json`,
  );
  if (existing && typeof existing === "object") {
    const current = mapAgent(existing);
    if (current.email.trim().toLowerCase() === input.email.trim().toLowerCase()) {
      return current;
    }
    throw new ClientSafeError("Something went wrong. Try again.");
  }
  const row = {
    id: input.id,
    name: input.name,
    email: input.email,
    role: input.role || "Agent",
    status: "Active" as const,
  };
  await putItem("agents", input.id, row);
  return mapAgent(row);
}

export async function firebaseDeleteAgent(id: string): Promise<void> {
  await deleteItem("agents", id);
}

export async function firebaseUpsertCustomer(input: {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  clientId?: string | null;
  notes?: string;
}): Promise<Customer> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name || !phone) throw new ClientSafeError("Name and phone are required");
  const id = input.id || uid();
  const row = {
    id,
    name,
    phone,
    email: (input.email || "").trim(),
    company: (input.company || "").trim(),
    clientId: input.clientId || null,
    // Customer notes are derived from calls/messages in the UI; keep empty
    notes: "",
  };
  await putItem("customers", id, row);
  return mapCustomer(row);
}

export async function firebaseDeleteCustomer(id: string): Promise<void> {
  await deleteItem("customers", id);
}

export async function firebaseUpsertClient(input: {
  id?: string;
  name: string;
  industry?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: string;
  address?: string;
  notes?: string;
}): Promise<Client> {
  const name = input.name.trim();
  if (!name) throw new ClientSafeError("Company name is required");
  const id = input.id || uid();
  const row = {
    id,
    name,
    industry: (input.industry || "").trim(),
    phone: (input.phone || "").trim(),
    email: (input.email || "").trim(),
    website: (input.website || "").trim(),
    status: input.status || "Active",
    address: (input.address || "").trim(),
    notes: (input.notes || "").trim(),
  };
  await putItem("clients", id, row);
  return mapClient(row);
}

export async function firebaseDeleteClient(id: string): Promise<void> {
  await deleteItem("clients", id);
}

export async function firebaseUpsertCall(input: {
  id?: string;
  datetime: string;
  agentId?: string;
  customerId: string;
  clientId?: string | null;
  type?: string;
  duration: number;
  outcome: string;
  rating?: number | null;
  ratingScale?: 5 | 10;
  qa?: QaParts | null;
  notes?: string;
  followUpAt?: string | null;
  source?: "manual" | "telecom";
  csvCounted?: boolean;
}): Promise<Call> {
  if (!input.datetime || !input.customerId) {
    throw new ClientSafeError("Datetime and customer are required");
  }
  const id = input.id || uid();
  const prev = input.id
    ? await rtdbFetch<Record<string, unknown> | null>(`/calls/${encodeURIComponent(id)}.json`)
    : null;
  const rating =
    input.rating === undefined
      ? prev && prev.rating != null && prev.rating !== ""
        ? Number(prev.rating)
        : null
      : input.rating == null || (input.rating as unknown) === ""
        ? null
        : (() => {
            const n = Number(input.rating);
            if (!Number.isFinite(n) || n <= 0) return null;
            return Math.min(10, n);
          })();
  const prevScale =
    prev?.ratingScale === 5 || prev?.ratingScale === 10 ? (prev.ratingScale as 5 | 10) : undefined;
  const row = {
    id,
    datetime: input.datetime,
    agentId: input.agentId || "",
    customerId: input.customerId,
    clientId: input.clientId || null,
    type: input.type || "Inbound",
    duration: Number(input.duration) || 0,
    outcome: input.outcome || "Resolved",
    rating,
    ratingScale:
      rating == null
        ? ((prev?.ratingScale as 5 | 10 | null | undefined) ?? null)
        : input.ratingScale === 5 && rating <= 5
          ? 5
          : input.ratingScale === 10
            ? 10
            : prevScale === 5 && rating <= 5
              ? 5
              : 10,
    qa: input.qa !== undefined ? input.qa : parseStoredQa(prev?.qa),
    notes: input.notes != null ? String(input.notes).trim() : String(prev?.notes || "").trim(),
    followUpAt: input.followUpAt ? String(input.followUpAt).slice(0, 10) : null,
    source: prev?.source === "telecom" || input.source === "telecom" ? "telecom" : "manual",
    csvCounted:
      input.csvCounted === false
        ? false
        : input.csvCounted === true
          ? true
          : prev?.csvCounted === false
            ? false
            : prev?.csvCounted === true
              ? true
              : undefined,
  };
  await putItem("calls", id, row);
  return mapCall(row);
}

export async function firebaseDeleteCall(id: string): Promise<void> {
  await deleteItem("calls", id);
}

export async function firebaseUpsertMessage(input: {
  id?: string;
  datetime: string;
  agentId: string;
  customerId: string;
  clientId?: string | null;
  channel?: string;
  direction?: string;
  subject?: string;
  body: string;
  status?: string;
  notes?: string;
  followUpAt?: string | null;
}): Promise<Message> {
  if (!input.datetime || !input.customerId) {
    throw new ClientSafeError("Datetime and customer are required");
  }
  const body = (input.body || "").trim();
  if (!body) throw new ClientSafeError("Message body is required");
  const id = input.id || uid();
  const row = {
    id,
    datetime: input.datetime,
    agentId: input.agentId || "",
    customerId: input.customerId,
    clientId: input.clientId || null,
    channel: input.channel || "SMS",
    direction: input.direction || "Inbound",
    subject: (input.subject || "").trim(),
    body,
    status: input.status || "Open",
    notes: (input.notes || "").trim(),
    followUpAt: input.followUpAt ? String(input.followUpAt).slice(0, 10) : null,
  };
  await putItem("messages", id, row);
  return mapMessage(row);
}

export async function firebaseDeleteMessage(id: string): Promise<void> {
  await deleteItem("messages", id);
}

async function moveChild(
  collection: "calls" | "messages",
  id: string,
  dropId: string,
  keepId: string,
  keepClientId: string | null,
): Promise<void> {
  assertRecordId(id);
  const row = await rtdbFetch<Record<string, unknown> | null>(
    `/${collection}/${encodeURIComponent(id)}.json`,
  );
  if (!row || typeof row !== "object") return;
  if (String(row.customerId || "") !== dropId) return;
  const clientId = row.clientId ? String(row.clientId) : keepClientId;
  await rtdbFetch(`/${collection}/${encodeURIComponent(id)}.json`, {
    method: "PATCH",
    body: JSON.stringify({ customerId: keepId, clientId }),
  });
}

/**
 * Moves one small batch of calls or messages onto the kept customer.
 * The caller walks every matching id, then sets removeDropped on the last batch.
 * Does not read the rest of the database.
 */
export async function firebaseMergeBatch(input: {
  keepId: string;
  dropId: string;
  callIds: string[];
  messageIds: string[];
  removeDropped: boolean;
}): Promise<void> {
  if (!input.keepId || !input.dropId || input.keepId === input.dropId) {
    throw new ClientSafeError("Pick two different customers to merge");
  }
  if (input.callIds.length + input.messageIds.length > MERGE_BATCH) {
    throw new ClientSafeError("Check the form and try again.");
  }
  const keep = await rtdbFetch<Record<string, unknown> | null>(
    `/customers/${encodeURIComponent(input.keepId)}.json`,
  );
  const drop = await rtdbFetch<Record<string, unknown> | null>(
    `/customers/${encodeURIComponent(input.dropId)}.json`,
  );
  if (!keep || !drop || typeof keep !== "object" || typeof drop !== "object") {
    throw new ClientSafeError("Customer not found");
  }
  const keepClientId = keep.clientId ? String(keep.clientId) : null;
  for (const id of input.callIds) {
    await moveChild("calls", id, input.dropId, input.keepId, keepClientId);
  }
  for (const id of input.messageIds) {
    await moveChild("messages", id, input.dropId, input.keepId, keepClientId);
  }
  if (input.removeDropped) await deleteItem("customers", input.dropId);
}
