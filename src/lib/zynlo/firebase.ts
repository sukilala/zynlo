/**
 * Shared Zynlo workspace on Firebase Realtime Database.
 * Sole persistence for CRM data - no local / PGlite / Neon / disk snapshots.
 */
import type {
  Agent,
  Call,
  Client,
  Customer,
  Message,
  QaParts,
  ZynloData,
} from "./types";
import { QA_PARTS } from "./types";

const RTDB_ROOT =
  "https://zynlo-crm-default-rtdb.firebaseio.com";

function parseQa(raw: unknown): QaParts | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const out = {} as QaParts;
  for (const part of QA_PARTS) {
    const n = Number(src[part.key]);
    if (!Number.isFinite(n) || n < 1 || n > 10) return null;
    out[part.key] = n;
  }
  return out;
}

const COLLECTIONS = [
  "agents",
  "customers",
  "clients",
  "calls",
  "messages",
] as const;

type Collection = (typeof COLLECTIONS)[number];

const collectionCache: Partial<
  Record<Collection, { etag: string; data: unknown }>
> = {};
let mappedCache: { at: number; data: ZynloData } | null = null;
let cacheGen = 0;

function invalidateCache(col?: Collection) {
  cacheGen += 1;
  mappedCache = null;
  if (col) delete collectionCache[col];
  else {
    for (const c of COLLECTIONS) delete collectionCache[c];
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

async function rtdbFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${RTDB_ROOT}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Firebase ${init?.method || "GET"} ${path} failed (${res.status}): ${text || res.statusText}`,
    );
  }
  if ((init?.method || "GET").toUpperCase() === "DELETE") return null as T;
  const text = await res.text();
  if (!text || text === "null") return null as T;
  return JSON.parse(text) as T;
}

/** Turn list or sparse numeric-key object into id-keyed map. */
function toIdMap(
  raw: unknown,
): Record<string, Record<string, unknown>> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const m: Record<string, Record<string, unknown>> = {};
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = String(row.id || uid());
      m[id] = { ...row, id };
    }
    return m;
  }
  if (typeof raw === "object") {
    const m: Record<string, Record<string, unknown>> = {};
    for (const [key, item] of Object.entries(
      raw as Record<string, unknown>,
    )) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = String(row.id || key);
      // Skip pure numeric keys that already have id field content handled
      m[id] = { ...row, id };
    }
    return m;
  }
  return {};
}

function needsMigration(raw: unknown): boolean {
  if (raw == null) return false;
  if (Array.isArray(raw)) return true;
  if (typeof raw === "object") {
    const keys = Object.keys(raw as object);
    // Numeric keys mean former array
    return keys.some((k) => /^\d+$/.test(k));
  }
  return false;
}

let migratePromise: Promise<void> | null = null;

/** One-time (per process) convert array collections → maps by id. */
async function rtdbGetCollection(col: Collection): Promise<unknown> {
  const path = `/${col}.json`;
  const url = `${RTDB_ROOT}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Firebase-ETag": "true",
  };
  const prev = collectionCache[col];
  if (prev?.etag) headers["If-None-Match"] = prev.etag;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (res.status === 304 && prev) return prev.data;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Firebase GET ${path} failed (${res.status}): ${text || res.statusText}`,
    );
  }
  const etag = res.headers.get("ETag") || res.headers.get("etag") || "";
  const text = await res.text();
  const data = !text || text === "null" ? null : JSON.parse(text);
  if (etag) collectionCache[col] = { etag, data };
  return data;
}

async function loadCollections(): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    COLLECTIONS.map(async (col) => {
      const raw = await rtdbGetCollection(col);
      return [col, raw] as const;
    }),
  );
  const root: Record<string, unknown> = {};
  for (const [col, raw] of entries) root[col] = raw;
  return root;
}

export async function ensureFirebaseMaps(): Promise<void> {
  // Never rewrite a whole collection. That path used to PUT /calls.json
  // and could wipe saved calls.
}

function mapAgent(r: Record<string, unknown>): Agent {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    email: String(r.email || ""),
    role: String(r.role || "Agent"),
    status: (r.status as Agent["status"]) || "Active",
    passwordHash: r.passwordHash ? String(r.passwordHash) : "",
  };
}

function mapCustomer(r: Record<string, unknown>): Customer {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    phone: String(r.phone || ""),
    email: String(r.email || ""),
    company: String(r.company || ""),
    clientId: r.clientId ? String(r.clientId) : null,
    notes: String(r.notes || ""),
  };
}

function mapClient(r: Record<string, unknown>): Client {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    industry: String(r.industry || ""),
    phone: String(r.phone || ""),
    email: String(r.email || ""),
    website: String(r.website || ""),
    status: (r.status as Client["status"]) || "Active",
    address: String(r.address || ""),
    notes: String(r.notes || ""),
  };
}

function mapCall(
  r: Record<string, unknown>,
  clientIdOverride?: string | null,
): Call {
  return {
    id: String(r.id),
    datetime: String(r.datetime || ""),
    agentId: String(r.agentId || ""),
    customerId: String(r.customerId || ""),
    clientId:
      clientIdOverride !== undefined
        ? clientIdOverride
        : r.clientId
          ? String(r.clientId)
          : null,
    type: (r.type as Call["type"]) || "Inbound",
    duration: Number(r.duration) || 0,
    outcome: (r.outcome as Call["outcome"]) || "Resolved",
    rating: r.rating == null || r.rating === "" ? null : Number(r.rating),
    ratingScale:
      r.ratingScale === 10 || Number(r.rating) > 5
        ? 10
        : r.rating == null || r.rating === ""
          ? undefined
          : 5,
    qa: parseQa(r.qa),
    notes: String(r.notes || ""),
    followUpAt: r.followUpAt ? String(r.followUpAt).slice(0, 10) : null,
    source: r.source === "telecom" ? "telecom" : "manual",
    csvCounted: r.csvCounted === false ? false : r.csvCounted === true ? true : undefined,
  };
}

function mapMessage(r: Record<string, unknown>): Message {
  return {
    id: String(r.id),
    datetime: String(r.datetime || ""),
    agentId: String(r.agentId || ""),
    customerId: String(r.customerId || ""),
    clientId: r.clientId ? String(r.clientId) : null,
    channel: (r.channel as Message["channel"]) || "SMS",
    direction: (r.direction as Message["direction"]) || "Inbound",
    subject: String(r.subject || ""),
    body: String(r.body || ""),
    status: (r.status as Message["status"]) || "Open",
    notes: String(r.notes || ""),
    followUpAt: r.followUpAt ? String(r.followUpAt).slice(0, 10) : null,
  };
}

function valuesSorted(
  map: Record<string, Record<string, unknown>>,
  by: "name" | "datetime",
): Record<string, unknown>[] {
  const list = Object.values(map);
  if (by === "name") {
    return list.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")),
    );
  }
  return list.sort(
    (a, b) =>
      new Date(String(b.datetime || 0)).getTime() -
      new Date(String(a.datetime || 0)).getTime(),
  );
}

/** Normalize client/company names for fuzzy matching (CC Express variants). */
function normName(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildClientLookup(clients: Client[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const c of clients) {
    m.set(normName(c.name), c.id);
  }
  return m;
}

function resolveClientId(
  lookup: Map<string, string>,
  clientId: unknown,
  legacyClientName: unknown,
): string | null {
  if (clientId) return String(clientId);
  if (legacyClientName) {
    const id = lookup.get(normName(String(legacyClientName)));
    if (id) return id;
  }
  return null;
}

export async function firebaseLoadAll(retries = 0): Promise<ZynloData> {
  if (mappedCache && Date.now() - mappedCache.at < 20000) {
    return mappedCache.data;
  }
  const gen = cacheGen;
  const root = await loadCollections();
  if (gen !== cacheGen && retries < 2) {
    return firebaseLoadAll(retries + 1);
  }
  for (const col of COLLECTIONS) {
    if (needsMigration(root[col])) {
      root[col] = toIdMap(root[col]);
    }
  }

  const agents = valuesSorted(toIdMap(root.agents), "name").map(mapAgent);
  const clients = valuesSorted(toIdMap(root.clients), "name").map(mapClient);
  const clientLookup = buildClientLookup(clients);

  // Use stored clientId only - do not invent links from free-text company
  // (that re-applied old client names after users entered new ones).
  const customers = valuesSorted(toIdMap(root.customers), "name").map(mapCustomer);

  const calls = valuesSorted(toIdMap(root.calls), "datetime").map((r) =>
    mapCall(
      r,
      resolveClientId(clientLookup, r.clientId, r.client),
    ),
  );
  const messages = valuesSorted(toIdMap(root.messages), "datetime").map(
    mapMessage,
  );

  const data = { agents, customers, clients, calls, messages };
  if (gen !== cacheGen) {
    if (retries < 2) return firebaseLoadAll(retries + 1);
    return data;
  }
  mappedCache = { at: Date.now(), data };
  return data;
}

function assertRecordId(id: string) {
  if (!id || id.length < 6 || id.includes("/") || id.includes(".")) {
    throw new Error("Invalid record id");
  }
}

async function putItem(
  collection: Collection,
  id: string,
  row: Record<string, unknown>,
): Promise<void> {
  assertRecordId(id);
  invalidateCache(collection);
  const payload = { ...row, id, updatedAt: new Date().toISOString() };
  const path = `/${collection}/${encodeURIComponent(id)}.json`;
  const saved = await rtdbFetch<Record<string, unknown> | null>(path, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!saved || typeof saved !== "object") {
    throw new Error(`Save did not persist to ${collection}`);
  }
}

async function deleteItem(
  collection: Collection,
  id: string,
): Promise<void> {
  assertRecordId(id);
  invalidateCache(collection);
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
  passwordHash?: string;
}): Promise<Agent> {
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");
  const id = input.id || uid();
  let prev: Record<string, unknown> | null = null;
  if (input.id) {
    prev = await rtdbFetch<Record<string, unknown> | null>(
      `/agents/${encodeURIComponent(id)}.json`,
    );
  }
  const passwordHash =
    input.passwordHash ||
    (prev && typeof prev.passwordHash === "string" ? prev.passwordHash : "");
  if (!passwordHash) throw new Error("Password is required");
  const row = {
    id,
    name,
    email: (input.email || "").trim(),
    role: input.role || "Agent",
    status: input.status || "Active",
    passwordHash,
  };
  await putItem("agents", id, row);
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
  if (!name || !phone) throw new Error("Name and phone are required");
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
  if (!name) throw new Error("Company name is required");
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
    throw new Error("Datetime and customer are required");
  }
  const id = input.id || uid();
  let prev: Record<string, unknown> | null = null;
  if (input.id) {
    const cached = mappedCache?.data.calls.find((c) => c.id === id);
    if (cached) prev = cached as unknown as Record<string, unknown>;
    if (
      input.csvCounted !== true &&
      input.csvCounted !== false &&
      prev?.csvCounted !== true &&
      prev?.csvCounted !== false
    ) {
      const live = await rtdbFetch<Record<string, unknown> | null>(
        `/calls/${encodeURIComponent(id)}.json`,
      );
      if (live && typeof live === "object") {
        prev = { ...(prev || {}), ...live };
      }
    } else if (!prev) {
      prev = await rtdbFetch<Record<string, unknown> | null>(
        `/calls/${encodeURIComponent(id)}.json`,
      );
    }
  }
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
            return Math.round(Math.min(10, n) * 100) / 100;
          })();
  const prevScale =
    prev?.ratingScale === 5 || prev?.ratingScale === 10
      ? (prev.ratingScale as 5 | 10)
      : undefined;
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
        ? (prev?.ratingScale as 5 | 10 | null | undefined) ?? null
        : input.ratingScale === 5 && rating <= 5
          ? 5
          : input.ratingScale === 10
            ? 10
            : prevScale === 5 && rating <= 5
              ? 5
              : 10,
    qa:
      input.qa !== undefined
        ? input.qa
        : parseQa(prev?.qa),
    notes:
      input.notes != null
        ? String(input.notes).trim()
        : String(prev?.notes || "").trim(),
    followUpAt: input.followUpAt ? String(input.followUpAt).slice(0, 10) : null,
    source:
      prev?.source === "telecom" || input.source === "telecom"
        ? "telecom"
        : "manual",
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
    throw new Error("Datetime and customer are required");
  }
  const body = (input.body || "").trim();
  if (!body) throw new Error("Message body is required");
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

export async function firebaseMergeCustomers(
  keepId: string,
  dropId: string,
): Promise<void> {
  if (!keepId || !dropId || keepId === dropId) {
    throw new Error("Pick two different customers to merge");
  }
  const data = await firebaseLoadAll();
  const keep = data.customers.find((c) => c.id === keepId);
  const drop = data.customers.find((c) => c.id === dropId);
  if (!keep || !drop) throw new Error("Customer not found");
  for (const call of data.calls.filter((c) => c.customerId === dropId)) {
    await firebaseUpsertCall({
      id: call.id,
      datetime: call.datetime,
      agentId: call.agentId,
      customerId: keepId,
      clientId: call.clientId || keep.clientId,
      type: call.type,
      duration: call.duration,
      outcome: call.outcome,
      rating: call.rating,
      ratingScale: call.ratingScale,
      qa: call.qa || null,
      notes: call.notes,
      followUpAt: call.followUpAt,
      source: call.source === "telecom" ? "telecom" : "manual",
      csvCounted: call.csvCounted,
    });
  }
  for (const msg of (data.messages || []).filter((m) => m.customerId === dropId)) {
    await firebaseUpsertMessage({
      id: msg.id,
      datetime: msg.datetime,
      agentId: msg.agentId,
      customerId: keepId,
      clientId: msg.clientId || keep.clientId,
      channel: msg.channel,
      direction: msg.direction,
      subject: msg.subject,
      body: msg.body,
      status: msg.status,
      notes: msg.notes,
      followUpAt: msg.followUpAt,
    });
  }
  await firebaseDeleteCustomer(dropId);
}
