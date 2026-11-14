import assert from "node:assert/strict";
import { test } from "node:test";
import { exportPKCS8, generateKeyPair, importPKCS8, SignJWT } from "jose";
import { countsInCallLog } from "./utils.ts";
import {
  compareFirebaseKey,
  mapCall,
  orderedRows,
  pageCountFor,
  pageFromRaw,
  RTDB_PAGE_SIZE,
  rtdbPageQuery,
  sliceOrderedRows,
  type OrderedRow,
} from "./records.ts";
import { singleFlight } from "./single-flight.ts";
import { loadPagedWorkspace, mergeBatches } from "./workspace-pages.ts";

test("page query orders by record id and does not need an index", () => {
  const first = new URLSearchParams(rtdbPageQuery(null, RTDB_PAGE_SIZE));
  assert.equal(first.get("orderBy"), '"$key"');
  assert.equal(first.get("limitToFirst"), String(RTDB_PAGE_SIZE + 1));
  assert.equal(first.get("startAt"), null);

  const next = new URLSearchParams(rtdbPageQuery("abc_123", 64));
  assert.equal(next.get("orderBy"), '"$key"');
  assert.equal(next.get("limitToFirst"), "66");
  assert.equal(next.get("startAt"), '"abc_123"');
});

test("cursor is dropped when Firebase repeats it, and a deleted cursor is kept", () => {
  const rows: OrderedRow[] = ["b", "c", "d", "e"].map((key) => ({
    key,
    value: { id: key },
  }));
  const page = sliceOrderedRows(rows, 2, "b");
  assert.deepEqual(
    page.rows.map((row) => row.key),
    ["c", "d"],
  );
  assert.equal(page.nextCursor, "d");

  const missing = sliceOrderedRows(rows, 2, "a");
  assert.deepEqual(
    missing.rows.map((row) => row.key),
    ["b", "c"],
  );
  assert.equal(missing.nextCursor, "c");

  const last = sliceOrderedRows(rows.slice(0, 2), 2, "b");
  assert.deepEqual(
    last.rows.map((row) => row.key),
    ["c"],
  );
  assert.equal(last.nextCursor, null);
});

test("unordered firebase pages do not skip records between cursors", () => {
  const keys: string[] = [];
  for (let i = 0; i < 80; i++) keys.push(String(i));
  for (let i = 0; i < 40; i++) keys.push(`uuid-${String(i).padStart(3, "0")}`);
  keys.sort(compareFirebaseKey);
  const limit = 10;
  function windowKeys(cursor: string | null): string[] {
    const count = cursor ? limit + 2 : limit + 1;
    let start = 0;
    if (cursor) {
      start = keys.findIndex((key) => compareFirebaseKey(key, cursor) >= 0);
      if (start < 0) start = keys.length;
    }
    return keys.slice(start, start + count);
  }
  function shuffle(list: string[]): string[] {
    const arr = list.slice();
    let seed = 3;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const seen = new Set<string>();
  let cursor: string | null = null;
  for (let page = 0; page < 40; page++) {
    const slice = windowKeys(cursor);
    const body = `{${shuffle(slice)
      .map((key) => `${JSON.stringify(key)}:${JSON.stringify({ id: key, name: key })}`)
      .join(",")}}`;
    const parsed = pageFromRaw("customers", JSON.parse(body), cursor, limit);
    if (parsed.collection !== "customers") break;
    for (const item of parsed.items) seen.add(item.id);
    if (!parsed.nextCursor || parsed.nextCursor === cursor || parsed.items.length === 0) break;
    cursor = parsed.nextCursor;
  }
  assert.equal(seen.size, keys.length);
});

test("agent pages never include the password hash", () => {
  const page = pageFromRaw(
    "agents",
    {
      abcdef: {
        id: "abcdef",
        name: "Susika",
        email: "susika.vs@gmail.com",
        role: "Admin",
        status: "Active",
        passwordHash: "do-not-leak",
      },
    },
    null,
  );
  assert.equal(page.collection, "agents");
  if (page.collection !== "agents") return;
  assert.equal(page.items[0]?.name, "Susika");
  assert.equal(Object.hasOwn(page.items[0] ?? {}, "passwordHash"), false);
  assert.equal(page.nextCursor, null);
});

test("call pages keep a legacy company name for the browser to resolve", () => {
  const page = pageFromRaw(
    "calls",
    {
      call01: {
        id: "call01",
        datetime: "2026-11-01T09:00:00.000Z",
        agentId: "agent01",
        customerId: "cust01",
        client: "CC Express",
        type: "Inbound",
        duration: 2,
        outcome: "Resolved",
        qa: {
          greeting: 10,
          communication: 10,
          compliance: 10,
          resolution: 10,
          closing: 10,
        },
        notes: "Asked about a delivery",
      },
      call02: {
        id: "call02",
        datetime: "2026-11-02T09:00:00.000Z",
        agentId: "agent01",
        customerId: "cust01",
        clientId: "already",
        client: "Other Name",
        type: "Outbound",
        duration: 1,
        outcome: "Resolved",
        notes: "",
      },
    },
    null,
  );
  assert.equal(page.collection, "calls");
  if (page.collection !== "calls") return;
  assert.equal(page.items[0]?.clientId, null);
  assert.equal(page.legacyClients[0], "CC Express");
  assert.equal(page.items[0]?.rating, 10);
  assert.equal(page.items[1]?.clientId, "already");
  assert.equal(page.legacyClients[1], null);
});

function person(id: string, name: string) {
  return {
    id,
    name,
    phone: "0770000000",
    email: "",
    company: "",
    clientId: null,
    notes: "",
  };
}

test("paged loads append, dedupe the cursor row, then search and counts see everyone", async () => {
  const hidden = mapCall({
    id: "call03",
    datetime: "2026-11-03T09:00:00.000Z",
    agentId: "agent01",
    customerId: "cust03",
    type: "Inbound",
    duration: 1,
    outcome: "Resolved",
    csvCounted: false,
    notes: "",
  });
  const data = await loadPagedWorkspace(async (collection, cursor) => {
    if (collection === "customers") {
      if (!cursor) {
        return {
          collection,
          items: [person("cust02", "Zara"), person("cust01", "Ama")],
          nextCursor: "cust01",
        };
      }
      return {
        collection,
        items: [person("cust01", "Ama"), person("cust03", "Nimal")],
        nextCursor: null,
      };
    }
    if (collection === "clients") {
      return {
        collection,
        items: [
          {
            id: "client1",
            name: "CC Express",
            industry: "",
            phone: "",
            email: "",
            website: "",
            status: "Active",
            address: "",
            notes: "",
          },
        ],
        nextCursor: null,
      };
    }
    if (collection === "calls") {
      if (!cursor) {
        return {
          collection,
          items: [
            mapCall({
              id: "call01",
              datetime: "2026-11-01T09:00:00.000Z",
              agentId: "agent01",
              customerId: "cust01",
              type: "Inbound",
              duration: 3,
              outcome: "Resolved",
              notes: "invoice",
            }),
          ],
          legacyClients: ["CC-Express"],
          nextCursor: "call01",
        };
      }
      return {
        collection,
        items: [
          mapCall({
            id: "call01",
            datetime: "2026-11-01T09:00:00.000Z",
            agentId: "agent01",
            customerId: "cust01",
            type: "Inbound",
            duration: 3,
            outcome: "Resolved",
            notes: "invoice",
          }),
          mapCall({
            id: "call02",
            datetime: "2026-11-04T09:00:00.000Z",
            agentId: "agent01",
            customerId: "cust02",
            type: "Outbound",
            duration: 2,
            outcome: "Escalated",
            notes: "",
          }),
          hidden,
        ],
        legacyClients: ["CC-Express", null, null],
        nextCursor: null,
      };
    }
    if (collection === "agents") {
      return {
        collection,
        items: [
          {
            id: "agent01",
            name: "Susika",
            email: "susika.vs@gmail.com",
            role: "Admin",
            status: "Active",
          },
        ],
        nextCursor: null,
      };
    }
    return { collection, items: [], nextCursor: null };
  });

  assert.deepEqual(
    data.customers.map((customer) => customer.name),
    ["Ama", "Nimal", "Zara"],
  );
  assert.equal(data.customers.filter((customer) => customer.name.includes("im")).length, 1);
  assert.equal(data.calls.length, 3);
  assert.equal(data.calls.filter(countsInCallLog).length, 2);
  assert.equal(data.calls[0]?.id, "call02");
  assert.equal(data.calls.find((call) => call.id === "call01")?.clientId, "client1");
});

test("the five collections start together, then each one walks its own pages", async () => {
  let active = 0;
  let maxActive = 0;
  const firstWave: string[] = [];
  await loadPagedWorkspace(async (collection, cursor) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    if (!cursor) firstWave.push(collection);
    await new Promise((resolve) => setTimeout(resolve, 20));
    active -= 1;
    if (collection === "customers" && !cursor) {
      return { collection, items: [person("cust01", "Ama")], nextCursor: "cust01" };
    }
    if (collection === "agents") {
      return {
        collection,
        items: [
          {
            id: "agent01",
            name: "Susika",
            email: "susika.vs@gmail.com",
            role: "Admin",
            status: "Active",
          },
        ],
        nextCursor: null,
      };
    }
    if (collection === "calls") {
      return { collection, items: [], legacyClients: [], nextCursor: null };
    }
    return { collection, items: [], nextCursor: null };
  });
  assert.equal(maxActive, 5);
  assert.equal(new Set(firstWave).size, 5);
});

test("3365 records is 7 pages, and a full load of two large collections is 18 requests", () => {
  assert.equal(RTDB_PAGE_SIZE, 500);
  assert.equal(pageCountFor(3365), 7);
  assert.equal(pageCountFor(0), 1);
  const customers = pageCountFor(3365);
  const calls = pageCountFor(3365);
  const agents = pageCountFor(4);
  const clients = pageCountFor(20);
  const messages = pageCountFor(40);
  assert.equal(customers + calls + agents + clients + messages + 1, 18);
});

test("merge batches stay small and only the last batch removes the duplicate", () => {
  const ids = Array.from({ length: 25 }, (_, index) => `call${String(index).padStart(4, "0")}`);
  const batches = mergeBatches(ids, ["msg0001"]);
  assert.equal(batches.length, 3);
  assert.equal(batches[0]?.callIds.length, 20);
  assert.deepEqual(batches[0]?.messageIds, []);
  assert.equal(batches[0]?.removeDropped, false);
  assert.equal(batches[1]?.callIds.length, 5);
  assert.equal(batches[1]?.removeDropped, false);
  assert.deepEqual(batches[2]?.messageIds, ["msg0001"]);
  assert.equal(batches[2]?.removeDropped, true);
  assert.deepEqual(mergeBatches([], []), [{ callIds: [], messageIds: [], removeDropped: true }]);
});

test("concurrent token mints share one in-flight promise", async () => {
  const slot: { current: Promise<number> | null } = { current: null };
  let runs = 0;
  const first = singleFlight(slot, async () => {
    runs += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return 7;
  });
  const second = singleFlight(slot, async () => {
    runs += 1;
    return 9;
  });
  assert.equal(await first, 7);
  assert.equal(await second, 7);
  assert.equal(runs, 1);
  assert.equal(
    await singleFlight(slot, async () => {
      runs += 1;
      return 3;
    }),
    3,
  );
  assert.equal(runs, 2);
});

function customerRecord(index: number): Record<string, unknown> {
  return {
    id: `cust${String(index).padStart(6, "0")}`,
    name: `Customer ${index}`,
    phone: `077${String(index).padStart(7, "0")}`,
    email: `c${index}@example.com`,
    company: index % 4 === 0 ? "CC Express" : "",
    clientId: null,
    notes: "",
    updatedAt: "2026-11-01T00:00:00.000Z",
  };
}

function callRecord(index: number): Record<string, unknown> {
  return {
    id: `call${String(index).padStart(6, "0")}`,
    datetime: new Date(Date.UTC(2026, 0, 1, 0, index % 60, index % 60)).toISOString(),
    agentId: "agent01",
    customerId: `cust${String(index % 3365).padStart(6, "0")}`,
    clientId: null,
    client: index % 5 === 0 ? "CC Express" : "",
    type: index % 2 === 0 ? "Inbound" : "Outbound",
    duration: (index % 12) + 1,
    outcome: "Resolved",
    rating: 8,
    ratingScale: 10,
    qa: {
      greeting: 8,
      communication: 8,
      compliance: 8,
      resolution: 8,
      closing: 8,
    },
    notes: "Customer asked about the invoice and we sent a copy by email.",
    followUpAt: null,
    source: "manual",
    csvCounted: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
  };
}

function cpuMs(run: () => void): number {
  const start = process.cpuUsage();
  run();
  const used = process.cpuUsage(start);
  return (used.user + used.system) / 1000;
}

function bestCpu(run: () => void): number {
  run();
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 5; i++) best = Math.min(best, cpuMs(run));
  return best;
}

test("one page uses a fraction of the CPU of mapping the whole workspace", () => {
  const customerCount = 3365;
  const callCount = 3365;
  const customers: Record<string, unknown> = {};
  const calls: Record<string, unknown> = {};
  for (let i = 0; i < customerCount; i++) {
    const row = customerRecord(i);
    customers[String(row.id)] = row;
  }
  for (let i = 0; i < callCount; i++) {
    const row = callRecord(i);
    calls[String(row.id)] = row;
  }
  const customerJson = JSON.stringify(customers);
  const callJson = JSON.stringify(calls);
  const customerPage: Record<string, unknown> = {};
  const callPage: Record<string, unknown> = {};
  for (let i = 0; i < RTDB_PAGE_SIZE; i++) {
    customerPage[String(customerRecord(i).id)] = customerRecord(i);
    callPage[String(callRecord(i).id)] = callRecord(i);
  }
  const customerPageJson = JSON.stringify(customerPage);
  const callPageJson = JSON.stringify(callPage);

  const fullMs = bestCpu(() => {
    const parsedCustomers = JSON.parse(customerJson) as Record<string, unknown>;
    const parsedCalls = JSON.parse(callJson) as Record<string, unknown>;
    const mappedCustomers = orderedRows(parsedCustomers).map((row) => ({
      ...row.value,
      id: row.key,
      name: row.value.name,
    }));
    const mappedCalls = orderedRows(parsedCalls).map((row) =>
      mapCall({ ...row.value, id: row.key }),
    );
    mappedCustomers.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    mappedCalls.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    JSON.stringify(mappedCustomers);
    JSON.stringify(mappedCalls);
  });
  const pageMs = bestCpu(() => {
    const parsedCustomers = JSON.parse(customerPageJson);
    const parsedCalls = JSON.parse(callPageJson);
    const customerResult = pageFromRaw("customers", parsedCustomers, null);
    const callResult = pageFromRaw("calls", parsedCalls, null);
    JSON.stringify(customerResult);
    JSON.stringify(callResult);
  });
  console.log(
    `[cpu] full ${customerCount} customers + ${callCount} calls ${fullMs.toFixed(2)} ms; one ${RTDB_PAGE_SIZE}-record page ${pageMs.toFixed(2)} ms`,
  );
  assert.ok(pageMs * 8 < fullMs, `page ${pageMs} ms was not cheaper than full ${fullMs} ms`);
});

async function cpuAsync(run: () => Promise<void>): Promise<number> {
  const start = process.cpuUsage();
  await run();
  const used = process.cpuUsage(start);
  return (used.user + used.system) / 1000;
}

async function bestCpuAsync(run: () => Promise<void>): Promise<number> {
  await run();
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 5; i++) best = Math.min(best, await cpuAsync(run));
  return best;
}

test("importing the service-account key costs more than signing with a cached key", async () => {
  const { privateKey } = await generateKeyPair("RS256", { extractable: true });
  const pem = await exportPKCS8(privateKey);
  const key = await importPKCS8(pem, "RS256");
  async function signWith(cached: CryptoKey) {
    await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.database" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer("measure@example.iam.gserviceaccount.com")
      .setSubject("measure@example.iam.gserviceaccount.com")
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(cached);
  }
  const importMs = await bestCpuAsync(async () => {
    await importPKCS8(pem, "RS256");
  });
  const signMs = await bestCpuAsync(() => signWith(key));
  const importAndSignMs = await bestCpuAsync(async () => {
    await signWith(await importPKCS8(pem, "RS256"));
  });
  console.log(
    `[cpu] importPKCS8 ${importMs.toFixed(2)} ms; RS256 sign with cached key ${signMs.toFixed(2)} ms; import + sign ${importAndSignMs.toFixed(2)} ms`,
  );
  assert.ok(
    signMs < importAndSignMs,
    `cached sign ${signMs} ms was not cheaper than import + sign ${importAndSignMs} ms`,
  );
});
