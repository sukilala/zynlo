/**
 * Browser-side assembly. Agents, customers, clients, calls, and messages load
 * at the same time. Pages inside one collection follow the cursor. Search,
 * filters, and counts run after every page of every collection is in memory.
 */
import type { Agent, Call, Client, Customer, Message, ZynloData } from "./types.ts";
import {
  COLLECTIONS,
  MAX_COLLECTION_PAGES,
  MERGE_BATCH,
  type CollectionName,
  type DataPage,
} from "./records.ts";

export type PageFetcher = (collection: CollectionName, cursor: string | null) => Promise<DataPage>;

function normName(value: string): string {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function sortByName<T extends { name?: string }>(list: T[]): T[] {
  return list.slice().sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

function sortByDatetime<T extends { datetime?: string }>(list: T[]): T[] {
  return list
    .slice()
    .sort(
      (a, b) =>
        new Date(String(b.datetime || 0)).getTime() - new Date(String(a.datetime || 0)).getTime(),
    );
}

export function assembleWorkspace(input: {
  agents: Agent[];
  customers: Customer[];
  clients: Client[];
  calls: Call[];
  legacyClients: (string | null)[];
  messages: Message[];
}): ZynloData {
  const clients = sortByName(input.clients);
  const lookup = new Map<string, string>();
  for (const client of clients) lookup.set(normName(client.name), client.id);
  const calls = sortByDatetime(
    input.calls.map((call, index) => {
      if (call.clientId) return call;
      const legacy = input.legacyClients[index];
      if (!legacy) return call;
      const clientId = lookup.get(normName(legacy));
      return clientId ? { ...call, clientId } : call;
    }),
  );
  return {
    agents: sortByName(input.agents),
    customers: sortByName(input.customers),
    clients,
    calls,
    messages: sortByDatetime(input.messages || []),
  };
}

export function mergeBatches(
  callIds: string[],
  messageIds: string[],
): { callIds: string[]; messageIds: string[]; removeDropped: boolean }[] {
  const batches: { callIds: string[]; messageIds: string[]; removeDropped: boolean }[] = [];
  for (let i = 0; i < callIds.length; i += MERGE_BATCH) {
    batches.push({
      callIds: callIds.slice(i, i + MERGE_BATCH),
      messageIds: [],
      removeDropped: false,
    });
  }
  for (let i = 0; i < messageIds.length; i += MERGE_BATCH) {
    batches.push({
      callIds: [],
      messageIds: messageIds.slice(i, i + MERGE_BATCH),
      removeDropped: false,
    });
  }
  if (batches.length === 0) {
    return [{ callIds: [], messageIds: [], removeDropped: true }];
  }
  batches[batches.length - 1].removeDropped = true;
  return batches;
}

type ItemWithId = { id: string };

export async function loadPagedWorkspace(fetchPage: PageFetcher): Promise<ZynloData> {
  const agents: Agent[] = [];
  const customers: Customer[] = [];
  const clients: Client[] = [];
  const calls: Call[] = [];
  const messages: Message[] = [];
  const legacyClients: (string | null)[] = [];
  const seen: Record<CollectionName, Set<string>> = {
    agents: new Set(),
    customers: new Set(),
    clients: new Set(),
    calls: new Set(),
    messages: new Set(),
  };

  async function drain(collection: CollectionName): Promise<void> {
    let cursor: string | null = null;
    for (let pageIndex = 0; pageIndex < MAX_COLLECTION_PAGES; pageIndex++) {
      const page = await fetchPage(collection, cursor);
      if (page.collection !== collection) throw new Error("Could not load data");
      const items = page.items as ItemWithId[];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item?.id || seen[collection].has(item.id)) continue;
        seen[collection].add(item.id);
        if (page.collection === "agents") agents.push(item as Agent);
        else if (page.collection === "customers") customers.push(item as Customer);
        else if (page.collection === "clients") clients.push(item as Client);
        else if (page.collection === "calls") {
          calls.push(item as Call);
          legacyClients.push(page.legacyClients[i] ?? null);
        } else messages.push(item as Message);
      }
      if (!page.nextCursor || page.nextCursor === cursor || items.length === 0) return;
      cursor = page.nextCursor;
    }
    throw new Error("Could not load data");
  }

  await Promise.all(COLLECTIONS.map((collection) => drain(collection)));
  return assembleWorkspace({
    agents,
    customers,
    clients,
    calls,
    legacyClients,
    messages,
  });
}
