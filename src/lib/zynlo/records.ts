/**
 * Pure Firebase page shaping. No network, no full-database sort.
 * Pages are ordered by record id (`$key`), which needs no .indexOn rule.
 * Name and datetime order is applied once the browser has every page.
 */
import {
  QA_PARTS,
  type Agent,
  type Call,
  type Client,
  type Customer,
  type Message,
  type QaParts,
} from "./types.ts";
import { weightedQa } from "./utils.ts";

/** Records per Worker request. Small enough that parse + map stays cheap. */
export const RTDB_PAGE_SIZE = 64;

/** Ids moved in one merge request (one small read + one small patch each). */
export const MERGE_BATCH = 20;

/** Stops a cursor bug from paging forever. 400 * 64 covers well past today's data. */
export const MAX_COLLECTION_PAGES = 400;

export const COLLECTIONS = ["agents", "customers", "clients", "calls", "messages"] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

export type OrderedRow = { key: string; value: Record<string, unknown> };

export type DataPage =
  | { collection: "agents"; items: Agent[]; nextCursor: string | null }
  | { collection: "customers"; items: Customer[]; nextCursor: string | null }
  | { collection: "clients"; items: Client[]; nextCursor: string | null }
  | {
      collection: "calls";
      items: Call[];
      legacyClients: (string | null)[];
      nextCursor: string | null;
    }
  | { collection: "messages"; items: Message[]; nextCursor: string | null };

const RESERVED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * REST query for one page of a collection.
 * `startAt` is inclusive, so the next page asks for the cursor row plus one
 * extra and the caller drops the cursor row.
 */
export function rtdbPageQuery(cursor: string | null, limit: number): string {
  const count = cursor ? limit + 2 : limit + 1;
  const params = new URLSearchParams();
  params.set("orderBy", '"$key"');
  params.set("limitToFirst", String(count));
  if (cursor) params.set("startAt", JSON.stringify(cursor));
  return params.toString();
}

export function orderedRows(raw: unknown): OrderedRow[] {
  if (raw == null) return [];
  const rows: OrderedRow[] = [];
  if (Array.isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const value = raw[i];
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const key = String(i);
      if (RESERVED_KEYS.has(key)) continue;
      rows.push({ key, value: value as Record<string, unknown> });
    }
    return rows;
  }
  if (typeof raw !== "object") return [];
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (RESERVED_KEYS.has(key)) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    rows.push({ key, value: value as Record<string, unknown> });
  }
  return rows;
}

/**
 * `cursor` is the last key returned to the client. Firebase includes it again
 * because startAt is inclusive. If that key was deleted, the response already
 * starts at the next key, so it is kept as-is (do not re-sort; $key order is
 * not plain string order for numeric ids).
 */
export function sliceOrderedRows(
  rows: OrderedRow[],
  limit: number,
  cursor: string | null,
): { rows: OrderedRow[]; nextCursor: string | null } {
  let list = rows;
  if (cursor) {
    const idx = list.findIndex((row) => row.key === cursor);
    if (idx >= 0) list = list.slice(idx + 1);
  }
  const page = list.slice(0, limit);
  const nextCursor = list.length > limit ? (page[page.length - 1]?.key ?? null) : null;
  return { rows: page, nextCursor };
}

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

function withId(row: OrderedRow): Record<string, unknown> {
  const current = row.value.id != null ? String(row.value.id) : "";
  const id = current || row.key;
  if (row.value.id === id) return row.value;
  return { ...row.value, id };
}

export function mapAgent(r: Record<string, unknown>): Agent {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    email: String(r.email || ""),
    role: String(r.role || "Agent"),
    status: (r.status as Agent["status"]) || "Active",
  };
}

export function mapCustomer(r: Record<string, unknown>): Customer {
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

export function mapClient(r: Record<string, unknown>): Client {
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

export function mapCall(r: Record<string, unknown>): Call {
  const qa = parseQa(r.qa);
  const weighted = weightedQa(qa);
  const rawRating = r.rating == null || r.rating === "" ? null : Number(r.rating);
  const rating =
    weighted != null
      ? weighted
      : rawRating != null && Number.isFinite(rawRating)
        ? rawRating
        : null;
  const hidden = r.csvCounted === false || String(r.csvCounted).toLowerCase() === "false";
  return {
    id: String(r.id),
    datetime: String(r.datetime || ""),
    agentId: String(r.agentId || ""),
    customerId: String(r.customerId || ""),
    clientId: r.clientId ? String(r.clientId) : null,
    type: (r.type as Call["type"]) || "Inbound",
    duration: Number(r.duration) || 0,
    outcome: (r.outcome as Call["outcome"]) || "Resolved",
    rating,
    ratingScale:
      weighted != null || r.ratingScale === 10 || (rating != null && rating > 5)
        ? 10
        : rating == null
          ? undefined
          : 5,
    qa,
    notes: String(r.notes || ""),
    followUpAt: r.followUpAt ? String(r.followUpAt).slice(0, 10) : null,
    source: r.source === "telecom" ? "telecom" : "manual",
    csvCounted: hidden ? false : true,
  };
}

/** Old rows stored a company name in `client` instead of `clientId`. */
export function legacyClientOf(r: Record<string, unknown>, call: Call): string | null {
  if (call.clientId) return null;
  if (typeof r.client !== "string") return null;
  const name = r.client.trim();
  return name ? name : null;
}

export function mapMessage(r: Record<string, unknown>): Message {
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

export function pageFromRaw(
  collection: CollectionName,
  raw: unknown,
  cursor: string | null,
  limit = RTDB_PAGE_SIZE,
): DataPage {
  const size = Math.max(1, Math.min(limit, RTDB_PAGE_SIZE));
  const sliced = sliceOrderedRows(orderedRows(raw), size, cursor);
  const nextCursor = sliced.nextCursor;
  if (collection === "agents") {
    return {
      collection,
      items: sliced.rows.map((row) => mapAgent(withId(row))),
      nextCursor,
    };
  }
  if (collection === "customers") {
    return {
      collection,
      items: sliced.rows.map((row) => mapCustomer(withId(row))),
      nextCursor,
    };
  }
  if (collection === "clients") {
    return {
      collection,
      items: sliced.rows.map((row) => mapClient(withId(row))),
      nextCursor,
    };
  }
  if (collection === "calls") {
    const items: Call[] = [];
    const legacyClients: (string | null)[] = [];
    for (const row of sliced.rows) {
      const record = withId(row);
      const call = mapCall(record);
      items.push(call);
      legacyClients.push(legacyClientOf(record, call));
    }
    return { collection, items, legacyClients, nextCursor };
  }
  return {
    collection,
    items: sliced.rows.map((row) => mapMessage(withId(row))),
    nextCursor,
  };
}

export function parseStoredQa(raw: unknown): QaParts | null {
  return parseQa(raw);
}
