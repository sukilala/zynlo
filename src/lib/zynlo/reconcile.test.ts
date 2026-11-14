import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assignTelecomRows,
  buildReconcilePreviewFromRows,
  parseTelecomCsv,
  type TelecomRow,
} from "./reconcile-pdf.ts";
import type { Agent, Call, CallOutcome, Customer, ZynloData } from "./types.ts";

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
  duration = 1,
  outcome: CallOutcome = "Resolved",
  csvCounted = true,
): Call {
  return {
    id,
    datetime,
    agentId,
    customerId,
    clientId: null,
    type,
    duration,
    outcome,
    rating: null,
    notes: "",
    followUpAt: null,
    source: "manual",
    csvCounted,
  };
}

function queueCsv(lines: string[]): string {
  return [
    "Date,Queue,Caller,Position,Disconnection,Wait,Extension,Agent,Duration",
    ...lines,
  ].join("\n");
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
  const kamal = preview.agentTotals.find((row) => row.agentName.includes("Kamal"));
  assert.equal(kamal?.phoneSystem, 1);
  assert.equal(kamal?.logged, 0);
  assert.equal(kamal?.missing, 1);
  assert.equal(preview.extraIds.length, 0);
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

function oneQueue(line: string, data: ZynloData) {
  const rows = parseTelecomCsv(queueCsv([line]), null);
  return buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
}

test("the closer log wins when an earlier call is also inside 5 minutes", () => {
  const rows = parseTelecomCsv(
    queueCsv([
      "2026-11-14 10:00:00,1000 - Sinhala,0701111111,1,Agent,00:00:04,10,Harshika,00:01:00",
      "2026-11-14 10:04:30,1000 - Sinhala,0701111111,1,Agent,00:00:04,10,Harshika,00:01:00",
    ]),
    null,
  );
  const data = book(
    [customer("c1", "0701111111")],
    [call("near-later", "c1", "2026-11-14T10:04:00", "Inbound", "har", 1)],
  );
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
  assert.equal(preview.already.length, 1);
  assert.equal(preview.already[0]?.datetime, "2026-11-14T10:04:30");
  assert.equal(preview.missing[0]?.datetime, "2026-11-14T10:00:00");
  assert.deepEqual(preview.matchedIds, ["near-later"]);
  assert.equal(preview.extraIds.length, 0);
});

test("both logs are kept when the closest link would block the only link for the other call", () => {
  const rows = parseTelecomCsv(
    queueCsv([
      "2026-11-14 10:00:00,1000 - Sinhala,0701111111,1,Agent,00:00:04,10,Harshika,00:01:00",
      "2026-11-14 10:04:00,1000 - Sinhala,0701111111,1,Agent,00:00:04,10,Harshika,00:01:00",
    ]),
    null,
  );
  const data = book(
    [customer("c1", "0701111111")],
    [
      call("close-to-first", "c1", "2026-11-14T10:00:20", "Inbound", "har", 1),
      call("only-fits-first", "c1", "2026-11-14T09:56:00", "Inbound", "har", 1),
    ],
  );
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
  assert.equal(preview.missing.length, 0);
  assert.equal(preview.already.length, 2);
  assert.deepEqual(preview.matchedIds.slice().sort(), ["close-to-first", "only-fits-first"]);
  assert.equal(preview.unmatchedCrm.length, 0);
});

test("a log 3 to 5 minutes early still matches, and one over 5 minutes does not", () => {
  const early = oneQueue(
    "2026-11-14 09:29:36,1000 - Sinhala,0701007777,1,Agent,00:00:04,10,Harshika,00:03:21",
    book(
      [customer("c1", "0701007777")],
      [call("early", "c1", "2026-11-14T09:26:00", "Inbound", "har", 1)],
    ),
  );
  assert.equal(early.missing.length, 0);
  assert.equal(early.already.length, 1);
  assert.equal(early.numberDiffs.length, 0);
  assert.equal(early.directionFixes.length, 1);
  assert.deepEqual(early.matchedIds, ["early"]);

  const late = oneQueue(
    "2026-11-14 17:08:55,1000 - Sinhala,0701008888,1,Caller,00:00:08,10,Harshika,00:01:48",
    book(
      [customer("c1", "0701008888")],
      [call("too-early", "c1", "2026-11-14T17:02:00", "Inbound", "har", 1)],
    ),
  );
  assert.equal(late.missing.length, 1);
  assert.equal(late.already.length, 0);
  assert.deepEqual(late.unmatchedCrm.map((row) => row.callId), ["too-early"]);
  assert.equal(late.extraIds.length, 0);
});

test("a one-digit typo or the customer's other number is matched, not missing plus a hide", () => {
  const typo = oneQueue(
    "2026-11-14 14:35:19,1000 - Sinhala,0701001111,1,Agent,00:00:03,10,Harshika,00:02:21",
    book(
      [customer("c1", "0701002111")],
      [call("typo", "c1", "2026-11-14T14:34:30", "Inbound", "har", 2)],
    ),
  );
  assert.equal(typo.missing.length, 0);
  assert.equal(typo.unmatchedCrm.length, 0);
  assert.equal(typo.extraIds.length, 0);
  assert.equal(typo.directionFixes.length, 0);
  assert.equal(typo.optionalShrinks.length, 0);
  assert.equal(typo.numberDiffs.length, 1);
  assert.equal(typo.numberDiffs[0]?.kind, "one-digit");
  assert.equal(typo.numberDiffs[0]?.crmPhone, "0701002111");
  assert.equal(typo.numberDiffs[0]?.csvPhone, "0701001111");
  assert.equal(typo.agentTotals.find((row) => row.agentId === "har")?.logged, 1);
  assert.equal(typo.agentTotals.find((row) => row.agentId === "har")?.missing, 0);

  const other = oneQueue(
    "2026-11-14 09:16:16,1000 - Sinhala,0701003333,1,Agent,00:00:11,10,Harshika,00:02:04",
    book(
      [customer("c1", "0711111001")],
      [call("other", "c1", "2026-11-14T09:15:30", "Inbound", "har", 2)],
    ),
  );
  assert.equal(other.missing.length, 0);
  assert.equal(other.numberDiffs[0]?.kind, "other-number");
  assert.equal(other.numberDiffs[0]?.crmPhone, "0711111001");
  assert.equal(other.directionFixes.length, 0);
  assert.equal(other.extraIds.length, 0);

  const otherAgent = oneQueue(
    "2026-11-14 14:35:19,1000 - Sinhala,0701001111,1,Agent,00:00:03,10,Harshika,00:02:21",
    book(
      [customer("c1", "0701002111")],
      [call("pra-typo", "c1", "2026-11-14T14:35:00", "Inbound", "pra", 2)],
    ),
  );
  assert.equal(otherAgent.missing.length, 0);
  assert.equal(otherAgent.numberDiffs.length, 1);
  assert.equal(otherAgent.numberDiffs[0]?.kind, "agent-differs");
  assert.equal(otherAgent.numberDiffs[0]?.crmAgentName, "Praveena");
  assert.equal(otherAgent.numberDiffs[0]?.agentName, "Harshika");
  assert.equal(otherAgent.agentFixes.length, 0);
  assert.equal(otherAgent.directionFixes.length, 0);
  assert.equal(otherAgent.extraIds.length, 0);

  const otherAgentLater = oneQueue(
    "2026-11-14 14:38:19,1000 - Sinhala,0701001111,1,Agent,00:00:03,10,Harshika,00:02:21",
    book(
      [customer("c1", "0701002111")],
      [call("pra-later", "c1", "2026-11-14T14:35:00", "Inbound", "pra", 2)],
    ),
  );
  assert.equal(otherAgentLater.numberDiffs.length, 0);
  assert.equal(otherAgentLater.missing.length, 1);
  assert.deepEqual(otherAgentLater.unmatchedCrm.map((row) => row.callId), ["pra-later"]);

  const blank = oneQueue(
    "2026-11-14 14:35:19,1000 - Sinhala,0701001111,1,Agent,00:00:03,10,Harshika,00:02:21",
    book(
      [customer("c1", "0701002111")],
      [call("blank", "c1", "2026-11-14T14:35:00", "Inbound", "", 2)],
    ),
  );
  assert.equal(blank.numberDiffs.length, 1);
  assert.equal(blank.numberDiffs[0]?.kind, "one-digit");
  assert.equal(blank.agentFixes.length, 1);
  assert.equal(blank.agentFixes[0]?.toAgentId, "har");
  assert.equal(blank.missing.length, 0);
});

test("an outbound log is not offered for review when only the inbound file is open", () => {
  const preview = oneQueue(
    "2026-11-14 09:04:31,1001 - Tamil,0701000017,1,Caller,00:00:06,11,Oshadi,00:00:30",
    book(
      [customer("out", "0710000001"), customer("inn", "0701000017")],
      [
        call("outbound-log", "out", "2026-11-14T09:04:31", "Outbound", "pra", 1),
        call("too-far", "inn", "2026-11-14T09:10:00", "Inbound", "pra", 1),
      ],
    ),
  );
  assert.deepEqual(preview.unmatchedCrm.map((row) => row.callId), ["too-far"]);
  assert.equal(preview.extraIds.length, 0);
  assert.equal(preview.missing.length, 1);
});

test("a different-number log keeps its duration and prefers a longer call over one of 5 seconds", () => {
  const rows = parseTelecomCsv(
    queueCsv([
      "2026-11-14 10:28:43,1000 - Sinhala,0701004444,1,Agent,00:00:20,11,Oshadi,00:02:09",
      "2026-11-14 10:28:51,1000 - Sinhala,0701005555,1,Agent,00:00:04,11,Oshadi,00:00:01",
    ]),
    null,
  );
  const data = book(
    [customer("c1", "0701006666")],
    [call("long-log", "c1", "2026-11-14T10:29:00", "Inbound", "pra", 3)],
  );
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
  assert.equal(preview.numberDiffs.length, 1);
  assert.equal(preview.numberDiffs[0]?.csvPhone, "0701004444");
  assert.equal(preview.numberDiffs[0]?.kind, "other-number");
  assert.equal(preview.missing.length, 1);
  assert.equal(preview.missing[0]?.phone, "0701005555");
  assert.equal(preview.directionFixes.length, 0);
  assert.equal(preview.optionalShrinks.length, 0);

  const onlyShort = oneQueue(
    "2026-11-14 10:28:51,1000 - Sinhala,0701005555,1,Agent,00:00:04,11,Oshadi,00:00:04",
    book(
      [customer("c1", "0701006666")],
      [call("still-long", "c1", "2026-11-14T10:29:00", "Inbound", "pra", 2)],
    ),
  );
  assert.equal(onlyShort.numberDiffs.length, 1);
  assert.equal(onlyShort.directionFixes.length, 0);
  assert.equal(onlyShort.optionalShrinks.length, 0);
});

test("exact-number duration updates do not shrink a minute-long log under 10 seconds unless asked", () => {
  const shrink = oneQueue(
    "2026-11-14 11:00:00,1000 - Sinhala,0701001212,1,Agent,00:00:04,10,Harshika,00:00:04",
    book(
      [customer("c1", "0701001212")],
      [call("two-min", "c1", "2026-11-14T11:00:00", "Inbound", "har", 2)],
    ),
  );
  assert.equal(shrink.directionFixes.length, 0);
  assert.equal(shrink.optionalShrinks.length, 1);
  assert.equal(shrink.optionalShrinks[0]?.fromDuration, 2);
  assert.equal(shrink.optionalShrinks[0]?.toDuration, 0.1);
  assert.equal(shrink.shrinkIds.length, 0);
  assert.equal(shrink.numberDiffs.length, 0);

  const keep = oneQueue(
    "2026-11-14 11:00:00,1000 - Sinhala,0701001212,1,Agent,00:00:04,10,Harshika,00:01:30",
    book(
      [customer("c1", "0701001212")],
      [call("three-min", "c1", "2026-11-14T11:00:00", "Inbound", "har", 3)],
    ),
  );
  assert.equal(keep.optionalShrinks.length, 0);
  assert.equal(keep.directionFixes.length, 1);
  assert.equal(keep.directionFixes[0]?.toDuration, 1.5);
});

test("a no-answer, voicemail, or hidden log does not cover a different number", () => {
  const line = "2026-11-14 10:15:00,1000 - Sinhala,0701001414,1,Agent,00:00:04,10,Harshika,00:02:00";
  for (const [id, outcome, counted] of [
    ["na", "No Answer", true],
    ["vm", "Voicemail", true],
    ["hid", "Resolved", false],
  ] as const) {
    const preview = oneQueue(
      line,
      book(
        [customer("c1", "0701001515")],
        [call(id, "c1", "2026-11-14T10:15:00", "Inbound", "har", 2, outcome, counted)],
      ),
    );
    assert.equal(preview.missing.length, 1, id);
    assert.equal(preview.numberDiffs.length, 0, id);
    assert.equal(preview.already.length, 0, id);
    assert.equal(preview.unmatchedCrm.some((row) => row.callId === id), false, id);
  }
});

test("a second log of the same number in the same minute is marked duplicate", () => {
  const rows = parseTelecomCsv(
    queueCsv([
      "2026-11-14 10:00:10,1000 - Sinhala,0701001313,1,Agent,00:00:04,10,Harshika,00:01:00",
    ]),
    null,
  );
  const data = book(
    [customer("c1", "0701001313")],
    [
      call("first", "c1", "2026-11-14T10:00:00", "Inbound", "har", 1),
      call("second", "c1", "2026-11-14T10:00:40", "Inbound", "har", 1),
      call("later", "c1", "2026-11-14T11:30:00", "Inbound", "har", 1),
    ],
  );
  const preview = buildReconcilePreviewFromRows("queue.csv", rows, data, agents, "Inbound", true);
  assert.equal(preview.matchedIds.length, 1);
  const second = preview.unmatchedCrm.find((row) => row.callId === "second");
  const later = preview.unmatchedCrm.find((row) => row.callId === "later");
  assert.equal(second?.duplicate, true);
  assert.equal(later?.duplicate, false);
  assert.equal(preview.extraIds.length, 0);
});

test("14 Nov phone-system files pair early logs and different numbers, and hide nothing", () => {
  const dir = join(dirname(fileURLToPath(import.meta.url)), "fixtures/reconcile");
  const parsed = assignTelecomRows(
    [
      ...parseTelecomCsv(readFileSync(join(dir, "2026-11-14-queue-inbound.csv"), "utf8"), null),
      ...parseTelecomCsv(readFileSync(join(dir, "2026-11-14-outbound-ext-10.csv"), "utf8"), null),
      ...parseTelecomCsv(readFileSync(join(dir, "2026-11-14-outbound-ext-11.csv"), "utf8"), null),
    ],
    agents,
  );
  assert.equal(parsed.filter((row) => row.type === "Inbound").length, 65);
  assert.equal(parsed.filter((row) => row.type === "Outbound").length, 8);
  assert.equal(parsed.length, 73);

  assert.ok(parsed.every((row) => /^0701\d{6}$/.test(row.phone)));
  const marks: Record<string, "exact" | "early" | "one-digit" | "other" | "missing"> = {
    "Inbound|2026-11-14T09:29:36": "early",
    "Inbound|2026-11-14T11:49:10": "early",
    "Inbound|2026-11-14T12:00:55": "early",
    "Inbound|2026-11-14T16:06:05": "early",
    "Inbound|2026-11-14T10:26:55": "early",
    "Inbound|2026-11-14T12:16:51": "early",
    "Inbound|2026-11-14T15:46:14": "early",
    "Inbound|2026-11-14T09:14:22": "one-digit",
    "Inbound|2026-11-14T09:17:07": "one-digit",
    "Inbound|2026-11-14T14:35:19": "one-digit",
    "Inbound|2026-11-14T12:43:04": "one-digit",
    "Inbound|2026-11-14T09:16:16": "other",
    "Inbound|2026-11-14T11:50:47": "other",
    "Inbound|2026-11-14T14:22:45": "other",
    "Inbound|2026-11-14T12:53:48": "other",
    "Inbound|2026-11-14T17:08:55": "missing",
    "Inbound|2026-11-14T10:36:02": "missing",
    "Inbound|2026-11-14T10:41:05": "missing",
    "Inbound|2026-11-14T11:24:57": "missing",
    "Inbound|2026-11-14T13:15:08": "missing",
    "Inbound|2026-11-14T14:06:16": "missing",
    "Inbound|2026-11-14T14:12:58": "missing",
    "Inbound|2026-11-14T14:13:50": "missing",
    "Inbound|2026-11-14T16:51:20": "missing",
    "Outbound|2026-11-14T10:55:40": "missing",
    "Outbound|2026-11-14T13:06:24": "missing",
    "Outbound|2026-11-14T13:07:40": "missing",
    "Inbound|2026-11-14T09:46:48": "missing",
    "Inbound|2026-11-14T12:40:22": "missing",
    "Inbound|2026-11-14T13:49:43": "missing",
  };
  const when: Record<string, string> = {
    "Inbound|2026-11-14T09:29:36": "2026-11-14T09:26:00",
    "Inbound|2026-11-14T11:49:10": "2026-11-14T11:46:00",
    "Inbound|2026-11-14T12:00:55": "2026-11-14T11:57:00",
    "Inbound|2026-11-14T16:06:05": "2026-11-14T16:03:00",
    "Inbound|2026-11-14T10:26:55": "2026-11-14T10:22:00",
    "Inbound|2026-11-14T12:16:51": "2026-11-14T12:12:00",
    "Inbound|2026-11-14T15:46:14": "2026-11-14T15:41:30",
    "Inbound|2026-11-14T09:14:22": "2026-11-14T09:14:00",
    "Inbound|2026-11-14T09:17:07": "2026-11-14T09:17:00",
    "Inbound|2026-11-14T14:35:19": "2026-11-14T14:34:30",
    "Inbound|2026-11-14T12:43:04": "2026-11-14T12:42:30",
    "Inbound|2026-11-14T09:16:16": "2026-11-14T09:15:30",
    "Inbound|2026-11-14T11:50:47": "2026-11-14T11:50:00",
    "Inbound|2026-11-14T14:22:45": "2026-11-14T14:22:00",
    "Inbound|2026-11-14T12:53:48": "2026-11-14T12:53:00",
  };
  for (const key of Object.keys(marks)) {
    assert.ok(parsed.some((row) => timeKey(row) === key), `missing CSV row ${key}`);
  }

  const customers: Customer[] = [];
  const calls: Call[] = [];
  const seen = new Set<string>();
  const chosen = new Map<string, string>();
  let otherN = 1;
  const addCustomer = (phone: string) => {
    if (!seen.has(phone)) {
      seen.add(phone);
      customers.push(customer(`c-${phone}`, phone));
    }
    return `c-${phone}`;
  };
  for (const row of parsed) {
    const key = timeKey(row);
    const mark = marks[key] ?? "exact";
    if (mark === "missing") continue;
    const phone = mark === "one-digit" ? flipDigit(row.phone) : mark === "other" ? `0719000${String(otherN++).padStart(3, "0")}` : row.phone;
    chosen.set(key, phone);
    const type = row.type === "Outbound" ? "Outbound" : "Inbound";
    calls.push(
      call(`log-${key}`, addCustomer(phone), when[key] ?? row.datetime, type, row.agentId, row.durationMin),
    );
  }
  const lateRow = parsed.find((row) => row.datetime === "2026-11-14T17:08:55");
  assert.ok(lateRow);
  calls.push(call("too-early", addCustomer(lateRow.phone), "2026-11-14T17:02:00", "Inbound", "har", 1));
  calls.push(call("extra-morning-pra", addCustomer("0710000001"), "2026-11-14T08:15:00", "Inbound", "pra", 1));
  calls.push(call("extra-morning-har", addCustomer("0710000002"), "2026-11-14T08:20:00", "Inbound", "har", 1));
  calls.push(call("extra-night", addCustomer("0710000003"), "2026-11-14T18:10:00", "Outbound", "har", 1));
  calls.push(call("extra-afternoon", addCustomer("0710000004"), "2026-11-14T13:30:00", "Inbound", "pra", 1));
  calls.push(call("already-hidden", addCustomer("0710000099"), "2026-11-14T12:00:00", "Inbound", "pra", 1, "Resolved", false));
  calls.push(call("no-answer", addCustomer("0710000098"), "2026-11-14T12:05:00", "Inbound", "har", 1, "No Answer", true));
  calls.push(call("other-day", addCustomer("0710000097"), "2026-11-13T12:00:00", "Inbound", "pra", 1));

  const preview = buildReconcilePreviewFromRows("3 files", parsed, book(customers, calls), agents, null, true);
  const diffByKey = new Map(
    preview.numberDiffs.map((row) => [`${row.type}|${row.datetime}|${row.csvPhone}`, row]),
  );
  for (const row of parsed) {
    const key = timeKey(row);
    const full = rowKey(row);
    const mark = marks[key] ?? "exact";
    const missing = preview.missing.some((item) => rowKey(item) === full);
    const logged = preview.already.some((item) => rowKey(item) === full);
    if (mark === "missing") {
      assert.equal(missing, true, key);
      assert.equal(logged, false, key);
    } else if (mark === "one-digit" || mark === "other") {
      assert.equal(logged, true, key);
      assert.equal(missing, false, key);
      assert.equal(diffByKey.get(full)?.crmPhone, chosen.get(key), key);
      assert.equal(diffByKey.get(full)?.kind, mark === "one-digit" ? "one-digit" : "other-number", key);
    } else {
      assert.equal(logged, true, key);
      assert.equal(missing, false, key);
      assert.equal(diffByKey.has(full), false, key);
    }
  }

  assert.equal(preview.answered, 73);
  assert.equal(preview.already.length, 58);
  assert.equal(preview.missing.length, 15);
  assert.equal(preview.numberDiffs.length, 8);
  assert.equal(preview.extraIds.length, 0);
  assert.equal(preview.agentFixes.length, 0);
  assert.equal(preview.directionFixes.length, 0);
  assert.deepEqual(
    preview.unmatchedCrm.map((row) => row.callId).sort(),
    ["extra-afternoon", "extra-morning-har", "extra-morning-pra", "extra-night", "too-early"],
  );
  assert.equal(preview.matchedIds.includes("too-early"), false);
  assert.equal(preview.matchedIds.includes("already-hidden"), false);
  assert.equal(preview.unmatchedCrm.some((row) => row.callId === "no-answer"), false);
  assert.equal(preview.unmatchedCrm.some((row) => row.callId === "other-day"), false);

  const pra = preview.agentTotals.find((row) => row.agentId === "pra");
  const har = preview.agentTotals.find((row) => row.agentId === "har");
  assert.equal(pra?.phoneSystem, 29);
  assert.equal(pra?.logged, 24);
  assert.equal(pra?.missing, 5);
  assert.equal(har?.phoneSystem, 44);
  assert.equal(har?.logged, 34);
  assert.equal(har?.missing, 10);
  assert.equal((pra?.logged ?? 0) + (pra?.missing ?? 0), pra?.phoneSystem);
  assert.equal((har?.logged ?? 0) + (har?.missing ?? 0), har?.phoneSystem);
});

function rowKey(row: Pick<TelecomRow, "type" | "datetime" | "phone">): string {
  return `${row.type}|${row.datetime}|${row.phone}`;
}

function timeKey(row: Pick<TelecomRow, "type" | "datetime">): string {
  return `${row.type}|${row.datetime}`;
}

function flipDigit(phone: string): string {
  const chars = phone.split("");
  const at = chars.length - 4;
  chars[at] = chars[at] === "5" ? "6" : "5";
  return chars.join("");
}
