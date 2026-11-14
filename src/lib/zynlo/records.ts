/**
 * Pure Firebase page shaping. No network, no full-database sort.
 * Pages are read by record id (`$key`), which needs no .indexOn rule.
 * The REST payload is not ordered, so each page is sorted into $key order
 * here before the next cursor is chosen. Name and datetime order is applied
 * once the browser has every page.
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

/**
 * Records per Worker request. A 500-record page of this shape is about 1–2 ms
 * of parse and map, under the free-plan CPU budget. 3,365 records is 7 pages.
 */
export const RTDB_PAGE_SIZE = 500;

/** Ids moved in one merge request (one small read + one small patch each). */
export const MERGE_BATCH = 20;

/** Stops a cursor bug from paging forever. */
export const MAX_COLLECTION_PAGES = 400;

/** Pages needed for a collection, including the request that discovers it is empty. */
export function pageCountFor(records: number): number {
  if (records <= 0) return 1;
  return Math.ceil(records / RTDB_PAGE_SIZE);
}

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

const FIREBASE_INT_MIN = -2147483648;
const FIREBASE_INT_MAX = 2147483647;

/** Same integer-key rule Firebase uses for `$key` order. */
function firebaseIntKey(key: string): number | null {
  if (!/^-?\d{1,10}$/.test(key)) return null;
  const value = Number(key);
  if (!Number.isInteger(value) || value < FIREBASE_INT_MIN || value > FIREBASE_INT_MAX) {
    return null;
  }
  return value;
}

/** Record-id order: 32-bit integer keys first, then every other key A to Z. */
export function compareFirebaseKey(a: string, b: string): number {
  if (a === b) return 0;
  const ai = firebaseIntKey(a);
  const bi = firebaseIntKey(b);
  if (ai !== null && bi !== null) {
    if (ai !== bi) return ai - bi;
    return a.length - b.length;
  }
  if (ai !== null) return -1;
  if (bi !== null) return 1;
  return a < b ? -1 : 1;
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
 * because startAt is inclusive. Keys are sorted into `$key` order first:
 * a filtered REST object does not keep that order, and trusting the raw
 * order skips every record that sits between the wrong cursor and the next page.
 */
export function sliceOrderedRows(
  rows: OrderedRow[],
  limit: number,
  cursor: string | null,
): { rows: OrderedRow[]; nextCursor: string | null } {
  const sorted = rows.slice().sort((a, b) => compareFirebaseKey(a.key, b.key));
  const list = cursor
    ? sorted.filter((row) => compareFirebaseKey(row.key, cursor) > 0)
    : sorted;
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
