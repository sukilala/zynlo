import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReconcilePreviewFromRows, parseTelecomCsv } from "./reconcile-pdf.ts";
import type { Agent, Call, Customer, ZynloData } from "./types.ts";

const agents: Agent[] = [
  {
    id: "pra",
    name: "Praveena",
    email: "sivakumarpraveena804@gmail.com",
    role: "Agent",
    status: "Active",
  },
  {
    id: "har",
    name: "Harshika",
    email: "iamharshika.7@gmail.com",
    role: "Agent",
    status: "Active",
  },
  {
    id: "sus",
    name: "Susika",
    email: "susika.vs@gmail.com",
    role: "Admin",
    status: "Active",
  },
];

function book(customers: Customer[], calls: Call[]): ZynloData {
  return { agents, customers, clients: [], calls, messages: [] };
}

function customer(id: string, phone: string): Customer {
  return { id, name: phone, phone, email: "", company: "", clientId: null, notes: "" };
}

function call(
  id: string,
  customerId: string,
  datetime: string,
  type: "Inbound" | "Outbound" = "Inbound",
  agentId = "",
): Call {
  return {
    id,
    datetime,
    agentId,
    customerId,
    clientId: null,
    type,
    duration: 1,
    outcome: "Resolved",
    rating: null,
    notes: "",
    followUpAt: null,
    source: "manual",
    csvCounted: true,
  };
}

const queue = [
  "Date,Queue,Caller,Position,Disconnection,Wait,Extension,Agent,Duration",
  "2026-11-14 09:04:31,1000 - Sinhala,0704520117,1,Caller,00:00:06,11,Oshadi,00:00:30",
  "2026-11-14 09:06:31,1000 - Sinhala,0704520117,1,Agent,00:00:03,11,Oshadi,00:01:44",
  "2026-11-14 11:04:31,1000 - Sinhala,0704520117,1,Agent,00:00:04,11,Oshadi,00:02:00",
  "2026-11-14 09:16:16,1000 - Sinhala,0764210086,1,Agent,00:00:11,10,Harshika,00:02:04",
  "2026-11-14 14:35:24,1000 - Sinhala,0761277897,1,Agent,00:00:42,10,Harshika,00:00:01",
  "2026-11-14 14:36:00,1000 - Sinhala,0761277897,1,Agent,00:00:02,10,Harshika,00:00:01",
  "2026-11-14 10:08:23,1001 - Tamil,+94755187784,1,Agent,00:00:04,12,Kamal,00:01:27",
].join("\n");

test("each answered CSV row stays its own call, including repeats and one-second calls", () => {
  const rows = parseTelecomCsv(queue, null);
  assert.equal(rows.length, 7);
  assert.ok(rows.every((row) => row.type === "Inbound"));
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, book([], []), agents, "Inbound", true);
  assert.equal(preview.answered, 7);
  assert.equal(preview.missing.length, 7);
  assert.equal(preview.missing.filter((row) => row.phone.endsWith("761277897")).length, 2);
  assert.equal(preview.missing.filter((row) => row.durationRaw === "00:00:01").length, 2);
  const oshadi = preview.missing.filter((row) => row.phone.endsWith("704520117"));
  assert.equal(oshadi.length, 3);
  assert.ok(oshadi.every((row) => row.agentId === "pra" && row.agentHint === "Praveena"));
  assert.equal(preview.missing.find((row) => row.phone.endsWith("764210086"))?.agentId, "har");
  assert.equal(preview.missing.find((row) => row.pbxName === "Kamal")?.agentId, "");
  assert.equal(preview.unmappedAgents.length, 1);
  assert.match(preview.unmappedAgents[0]?.label || "", /Kamal/);
  assert.ok(preview.missing.every((row) => row.datetime.startsWith("2026-11-14T")));
});

test("one CRM call covers one CSV call, not every repeat from that number", () => {
  const rows = parseTelecomCsv(queue, null);
  const data = book(
    [customer("c1", "0704520117")],
    [call("logged", "c1", "2026-11-14T09:04:00")],
  );
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
  const sameNumber = [...preview.already, ...preview.missing].filter((row) =>
    row.phone.endsWith("704520117"),
  );
  assert.equal(sameNumber.length, 3);
  assert.equal(preview.already.filter((row) => row.phone.endsWith("704520117")).length, 1);
  assert.equal(preview.missing.filter((row) => row.phone.endsWith("704520117")).length, 2);
  assert.equal(preview.matchedIds.length, 1);
});

test("a blank CRM agent on Oshadi's call is tagged to Praveena", () => {
  const rows = parseTelecomCsv(queue, null).filter((row) => row.pbxName === "Oshadi").slice(0, 1);
  const data = book(
    [customer("c1", "+94704520117")],
    [call("logged", "c1", "2026-11-14T09:04:31", "Inbound", "")],
  );
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
  assert.equal(preview.missing.length, 0);
  assert.equal(preview.agentFixes.length, 1);
  assert.equal(preview.agentFixes[0]?.toAgentId, "pra");
  assert.equal(preview.agentFixes[0]?.toAgentName, "Praveena");
});

test("outbound CDRs without outgoing in the file name are still counted", () => {
  const text = [
    "Date,Destination,Disposition,Duration,Wait time,Trunk,Extension,accountcode",
    "2026-11-14 10:55:40,724454646,ANSWERED,00:01:40,00:00:27,6,10,",
    "2026-11-14 13:06:24,0787418432,ANSWERED,00:00:33,00:00:07,6,11,",
    "2026-11-14 13:07:40,+94787418432,ANSWERED,00:00:31,00:00:07,6,11,",
    "2026-11-14 13:27:39,0786648171,NO ANSWER,00:00:00,00:00:07,6,10,",
  ].join("\n");
  const rows = parseTelecomCsv(text, null);
  assert.equal(rows.length, 4);
  assert.ok(rows.every((row) => row.type === "Outbound"));
  assert.equal(rows[0]?.phone, "0724454646");
  assert.equal(rows[0]?.agentId, "");
  const preview = buildReconcilePreviewFromRows("ext.csv", rows, book([], []), agents, "Outbound", false);
  assert.equal(preview.answered, 3);
  assert.equal(preview.skipped, 1);
  assert.equal(preview.missing.filter((row) => row.agentId === "har").length, 1);
  assert.equal(preview.missing.filter((row) => row.agentId === "pra").length, 2);
  const data = book(
    [customer("c1", "0724454646"), customer("c2", "0787418432")],
    [call("out1", "c1", "2026-11-14T10:55:40", "Outbound", "har")],
  );
  const again = buildReconcilePreviewFromRows("ext.csv", rows, data, agents, "Outbound", false);
  assert.equal(again.already.length, 1);
  assert.equal(again.missing.length, 2);
});

test("a file exported by Harshika still follows each row's extension", () => {
  const text = [
    "Generated by Harshika",
    "Date,Destination,Disposition,Duration,Wait time,Trunk,Extension,accountcode",
    "2026-11-14 13:06:24,0787418432,ANSWERED,00:00:33,00:00:07,6,11,",
    "2026-11-14 10:55:40,0724454646,ANSWERED,00:01:40,00:00:27,6,10,",
  ].join("\n");
  const rows = parseTelecomCsv(text, null);
  assert.equal(rows[0]?.pbxName, "");
  assert.equal(rows[0]?.extension, "11");
  const preview = buildReconcilePreviewFromRows(
    "Harshika outgoing.csv",
    rows,
    book([], []),
    agents,
    "Outbound",
    false,
  );
  assert.equal(preview.missing.find((row) => row.extension === "11")?.agentId, "pra");
  assert.equal(preview.missing.find((row) => row.extension === "10")?.agentId, "har");
});
