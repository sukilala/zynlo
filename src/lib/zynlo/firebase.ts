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
  ZynloData,
} from "./types";

const RTDB_ROOT =
  "https://zynlo-crm-default-rtdb.firebaseio.com";

const COLLECTIONS = [
  "agents",
  "customers",
  "clients",
  "calls",
  "messages",
] as const;

type Collection = (typeof COLLECTIONS)[number];

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
export async function ensureFirebaseMaps(): Promise<void> {
  if (!migratePromise) {
    migratePromise = (async () => {
      const root = await rtdbFetch<Record<string, unknown> | null>(
        "/.json",
      );
      if (!root) return;
      const updates: Record<string, Record<string, unknown>> = {};
      for (const col of COLLECTIONS) {
        const raw = root[col];
        if (needsMigration(raw)) {
          updates[col] = toIdMap(raw);
        } else if (raw == null) {
          // leave null
        } else if (typeof raw === "object" && !Array.isArray(raw)) {
          // already map-like; ensure every entry has id
          const m = toIdMap(raw);
          updates[col] = m;
        }
      }
      // Only rewrite collections that were arrays / sparse
      for (const col of COLLECTIONS) {
        const raw = root[col];
        if (needsMigration(raw)) {
          await rtdbFetch(`/${col}.json`, {
            method: "PUT",
            body: JSON.stringify(updates[col] || {}),
          });
          console.log("[firebase] migrated", col, "to id-map");
        }
      }
    })().catch((err) => {
      migratePromise = null;
      throw err;
    });
  }
  await migratePromise;
}

function mapAgent(r: Record<string, unknown>): Agent {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    email: String(r.email || ""),
    role: String(r.role || "Agent"),
    status: (r.status as Agent["status"]) || "Active",
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
    notes: String(r.notes || ""),
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

export async function firebaseLoadAll(): Promise<ZynloData> {
  await ensureFirebaseMaps();
  const root =
    (await rtdbFetch<Record<string, unknown> | null>("/.json")) || {};

  const agents = valuesSorted(toIdMap(root.agents), "name").map(mapAgent);
  const clients = valuesSorted(toIdMap(root.clients), "name").map(mapClient);
  const clientLookup = buildClientLookup(clients);

  const customers = valuesSorted(toIdMap(root.customers), "name").map((r) => {
    const c = mapCustomer(r);
    if (!c.clientId && c.company) {
      const resolved = clientLookup.get(normName(c.company));
      if (resolved) return { ...c, clientId: resolved };
    }
    return c;
  });

  const calls = valuesSorted(toIdMap(root.calls), "datetime").map((r) =>
    mapCall(
      r,
      resolveClientId(clientLookup, r.clientId, r.client),
    ),
  );
  const messages = valuesSorted(toIdMap(root.messages), "datetime").map(
    mapMessage,
  );

  return { agents, customers, clients, calls, messages };
}

async function putItem(
  collection: Collection,
  id: string,
  row: Record<string, unknown>,
): Promise<void> {
  await ensureFirebaseMaps();
  await rtdbFetch(`/${collection}/${encodeURIComponent(id)}.json`, {
    method: "PUT",
    body: JSON.stringify({ ...row, id, updatedAt: new Date().toISOString() }),
  });
}

async function deleteItem(
  collection: Collection,
  id: string,
): Promise<void> {
  await ensureFirebaseMaps();
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
  if (!name) throw new Error("Name is required");
  const id = input.id || uid();
  const row = {
    id,
    name,
    email: (input.email || "").trim(),
    role: input.role || "Agent",
    status: input.status || "Active",
  };
  await putItem("agents", id, row);
  return mapAgent(row);
}

export async function firebaseDeleteAgent(id: string): Promise<void> {
  const data = await firebaseLoadAll();
  await Promise.all([
    deleteItem("agents", id),
    ...data.calls
      .filter((c) => c.agentId === id)
      .map((c) => deleteItem("calls", c.id)),
    ...data.messages
      .filter((m) => m.agentId === id)
      .map((m) => deleteItem("messages", m.id)),
  ]);
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
  const data = await firebaseLoadAll();
  await Promise.all([
    deleteItem("customers", id),
    ...data.calls
      .filter((c) => c.customerId === id)
      .map((c) => deleteItem("calls", c.id)),
    ...data.messages
      .filter((m) => m.customerId === id)
      .map((m) => deleteItem("messages", m.id)),
  ]);
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
  agentId: string;
  customerId: string;
  clientId?: string | null;
  type?: string;
  duration: number;
  outcome: string;
  rating?: number | null;
  notes?: string;
}): Promise<Call> {
  if (!input.datetime || !input.agentId || !input.customerId) {
    throw new Error("Datetime, agent, and customer are required");
  }
  const id = input.id || uid();
  const rating =
    input.rating == null || (input.rating as unknown) === ""
      ? null
      : Number(input.rating);
  const row = {
    id,
    datetime: input.datetime,
    agentId: input.agentId,
    customerId: input.customerId,
    clientId: input.clientId || null,
    type: input.type || "Inbound",
    duration: Number(input.duration) || 0,
    outcome: input.outcome || "Resolved",
    rating,
    notes: (input.notes || "").trim(),
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
}): Promise<Message> {
  if (!input.datetime || !input.agentId || !input.customerId) {
    throw new Error("Datetime, agent, and customer are required");
  }
  const body = (input.body || "").trim();
  if (!body) throw new Error("Message body is required");
  const id = input.id || uid();
  const row = {
    id,
    datetime: input.datetime,
    agentId: input.agentId,
    customerId: input.customerId,
    clientId: input.clientId || null,
    channel: input.channel || "SMS",
    direction: input.direction || "Inbound",
    subject: (input.subject || "").trim(),
    body,
    status: input.status || "Open",
    notes: (input.notes || "").trim(),
  };
  await putItem("messages", id, row);
  return mapMessage(row);
}

export async function firebaseDeleteMessage(id: string): Promise<void> {
  await deleteItem("messages", id);
}
