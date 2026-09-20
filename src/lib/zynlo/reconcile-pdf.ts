import type { Agent, Call, CallType, Customer, ZynloData } from "./types";
import { findCustomerByPhone, phoneDigits } from "./utils";

/** Duplicate Cloud Talk legs of the same call. */
const CSV_DEDUPE_MS = 90 * 1000;
/** Manual logs are minute precision. Wider than this merges two real calls. */
const CRM_MATCH_MS = 3 * 60 * 1000;

export type TelecomRow = {
  datetime: string;
  phone: string;
  did: string;
  type: CallType;
  durationMin: number;
  durationRaw: string;
  disposition: string;
  agentHint: string;
  agentId: string;
  uid: string;
};

export type TelecomParse = {
  rows: TelecomRow[];
  generatedBy: string;
  fileDirection: CallType | null;
  queueAnswered?: boolean;
};

export type DirectionFix = {
  callId: string;
  phone: string;
  datetime: string;
  from: CallType;
  to: CallType;
  fromDuration: number;
  toDuration: number;
};

export type ReconcilePreview = {
  filename: string;
  answered: number;
  skipped: number;
  already: TelecomRow[];
  missing: TelecomRow[];
  missingInbound: TelecomRow[];
  missingOutbound: TelecomRow[];
  alreadyInbound: number;
  alreadyOutbound: number;
  directionFixes: DirectionFix[];
  matchedIds: string[];
  detectedAgentId: string;
  detectedAgentName: string;
  detectedDirection: CallType | null;
  extraIds: string[];
};

function hhmmssToMinutes(raw: string): number {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!m) return 0;
  const sec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  return Math.round((sec / 60) * 10) / 10;
}

function toIsoLocal(dt: string): string {
  return dt.trim().replace(" ", "T");
}

function extractPhone(block: string): string {
  const angled = block.match(/<0\d{8,11}>/);
  if (angled) return angled[0].replace(/\D/g, "");
  const compact = block.replace(/[^\d]/g, " ");
  const nums = compact.match(/\d{9,12}/g) || [];
  const mobile = nums.find((n) => n.startsWith("07") || (n.startsWith("7") && n.length === 9));
  if (mobile) return mobile.startsWith("0") ? mobile : `0${mobile}`;
  const local = nums.find((n) => n.startsWith("0") && !n.startsWith("011"));
  if (local) return local;
  const nine = nums.find((n) => n.length === 9 && n[0] === "7");
  if (nine) return `0${nine}`;
  return nums.find((n) => n.length >= 9) || "";
}

function typeFromLabel(raw: string): CallType | null {
  const k = (raw || "").toLowerCase();
  if (!k || k.includes("internal")) return null;
  if (/outgoing|outbound|out going|out-going/.test(k)) return "Outbound";
  if (/incoming|inbound|in coming|in-coming/.test(k)) return "Inbound";
  return null;
}

/** Filename and report title only. Never scan data rows. */
export function detectCallDirection(
  name: string,
  text = "",
): CallType | null {
  const lines = text.split(/\r?\n/).slice(0, 20);
  const preamble: string[] = [];
  for (const line of lines) {
    const low = line.toLowerCase();
    const compact = low.replace(/\s+/g, "");
    if (
      /(^|,)date(,|$)/.test(compact) ||
      (low.includes("disposition") && low.includes("date")) ||
      (low.includes("call type") && low.includes("date"))
    ) {
      break;
    }
    preamble.push(line);
  }
  const blob = `${name}\n${preamble.join("\n")}`.toLowerCase();
  if (
    /\boutgoing\b|\boutbound\b|\bout going\b|\bout-going\b|\bdialled\b|\bdialed\b/.test(
      blob,
    )
  ) {
    return "Outbound";
  }
  if (
    /\bincoming\b|\binbound\b|\bin coming\b|\bin-coming\b|\banswered\s*calls?\b/.test(
      blob,
    )
  ) {
    return "Inbound";
  }
  return null;
}

export function fileDirectionFromName(name: string): CallType | null {
  return detectCallDirection(name);
}

export function extractGeneratedBy(text: string): string {
  const email = text.match(
    /generated\s*by[:\s]+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
  );
  if (email) return email[1].trim();
  const name = text.match(
    /generated\s*by[:\s]+([A-Za-z][A-Za-z .'-]{1,40})/,
  );
  return name ? name[1].trim() : "";
}


const FILENAME_NOISE = new Set([
  "incoming",
  "outgoing",
  "inbound",
  "outbound",
  "in",
  "out",
  "call",
  "calls",
  "direct",
  "csv",
  "pdf",
  "xls",
  "xlsx",
  "report",
  "reports",
  "stats",
  "stat",
  "cloud",
  "telecom",
  "talk",
  "daily",
  "weekly",
  "monthly",
  "answered",
  "log",
  "logs",
  "export",
  "sheet",
  "data",
  "reconcile",
  "zynlo",
  "file",
  "and",
  "the",
  "for",
  "from",
  "to",
  "of",
  "on",
]);

export function detectAgentFromFilename(
  filename: string,
  agents: Agent[],
): string {
  if (!filename || agents.length === 0) return "";
  const base = filename.replace(/\.[^.]+$/, "");
  const cleaned = base
    .toLowerCase()
    .replace(/[()[\]{}]/g, " ")
    .replace(/[_.,-]+/g, " ");
  const tokens = cleaned
    .split(/\s+/)
    .filter(
      (t) => t && !FILENAME_NOISE.has(t) && !/^\d+$/.test(t) && t.length > 2,
    );
  if (tokens.length === 0) return "";
  const blob = tokens.join(" ");

  const byFull = agents.find((a) => {
    const n = a.name.toLowerCase().replace(/[_.,-]+/g, " ").trim();
    if (!n) return false;
    if (blob.includes(n)) return true;
    const parts = n.split(/\s+/).filter((p) => p.length > 1);
    return parts.length > 0 && parts.every((p) => tokens.includes(p));
  });
  if (byFull) return byFull.id;

  const byEmail = agents.find((a) => {
    const local = (a.email || "")
      .split("@")[0]
      .toLowerCase()
      .replace(/[._-]+/g, " ")
      .trim();
    return local.length > 2 && (blob.includes(local) || tokens.includes(local));
  });
  if (byEmail) return byEmail.id;

  const scored = agents
    .map((a) => {
      const parts = a.name
        .toLowerCase()
        .split(/\s+/)
        .filter((p) => p.length > 2);
      const hit = parts
        .filter((p) => tokens.includes(p) || blob.includes(p))
        .sort((x, y) => y.length - x.length)[0];
      return { a, len: hit ? hit.length : 0 };
    })
    .filter((x) => x.len >= 3)
    .sort((a, b) => b.len - a.len);
  if (scored.length === 0) return "";
  if (scored.length === 1 || scored[0].len > scored[1].len) return scored[0].a.id;
  return "";
}

export function matchAgentId(hint: string, agents: Agent[]): string {
  const raw = (hint || "").trim();
  if (!raw || agents.length === 0) return "";
  const h = raw.toLowerCase();
  const byEmail = agents.find((a) => (a.email || "").toLowerCase() === h);
  if (byEmail) return byEmail.id;
  const local = h.split("@")[0].replace(/[._]+/g, " ").trim();
  const byExact = agents.find(
    (a) => a.name.toLowerCase() === h || a.name.toLowerCase() === local,
  );
  if (byExact) return byExact.id;
  const tokens = local.split(/\s+/).filter((t) => t.length > 2);
  const scored = agents
    .map((a) => {
      const n = a.name.toLowerCase();
      const hit = tokens.some((t) => n.includes(t));
      return { a, hit };
    })
    .filter((x) => x.hit);
  if (scored.length === 1) return scored[0].a.id;
  return "";
}

export function parseTelecomText(
  text: string,
  fileDirection: CallType | null,
): TelecomRow[] {
  const generatedBy = extractGeneratedBy(text);
  const chunks = text.split(/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  const rows: TelecomRow[] = [];
  for (const chunk of chunks) {
    const dtMatch = chunk.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
    if (!dtMatch) continue;
    const dispMatch = chunk.match(/\b(ANSWERED|NO ANSWER|FAILED|BUSY)\b/i);
    if (!dispMatch) continue;
    const typeMatch = chunk.match(/\b(Incoming|Outgoing|Internal)\b/i);
    if (!typeMatch) continue;
    const kind = typeMatch[1].toLowerCase();
    if (kind === "internal") continue;
    const times = chunk.match(/\b\d{2}:\d{2}:\d{2}\b/g) || [];
    const durationRaw = times[1] || "00:00:00";
    const phone = extractPhone(chunk.slice(0, dispMatch.index || 0));
    if (phone.length < 7) continue;
    const type: CallType =
      fileDirection || (kind === "outgoing" ? "Outbound" : "Inbound");
    rows.push({
      datetime: toIsoLocal(dtMatch[1]),
      phone,
      did: (chunk.match(/\b011\d{7}\b/) || [""])[0],
      type,
      durationMin: hhmmssToMinutes(durationRaw),
      durationRaw,
      disposition: normalizeDisposition(dispMatch[1], hhmmssToMinutes(durationRaw)),
      agentHint: generatedBy,
      agentId: "",
      uid: `${toIsoLocal(dtMatch[1])}|${phone}|${type}|${durationRaw}`,
    });
  }
  return rows;
}

export function looksLikeCsv(text: string): boolean {
  const first = (text.split(/\r?\n/).find((l) => l.trim()) || "").toLowerCase();
  return (
    (first.includes(",") || first.includes(";")) &&
    (first.includes("disposition") ||
      first.includes("caller") ||
      first.includes("queue") ||
      first.includes("call type") ||
      first.includes("duration") ||
      first.includes("destination"))
  );
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === "," || ch === ";") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      if (row.some((c) => c)) rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some((c) => c)) rows.push(row);
  }
  return rows;
}

function normHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function headerIndex(headers: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const exact = headers.findIndex((h) => h === alias);
    if (exact >= 0) return exact;
  }
  for (const alias of aliases) {
    const i = headers.findIndex((h) => {
      if (!(h.includes(alias) || alias.includes(h))) return false;
      if (alias === "time" && (h.includes("wait") || h.includes("talk"))) {
        return false;
      }
      if (alias === "date" && h.includes("update")) return false;
      if (alias === "type" && h.includes("wait")) return false;
      return h === alias || h.startsWith(alias) || h.endsWith(alias);
    });
    if (i >= 0) return i;
  }
  return -1;
}

function isQueueAnsweredCsv(headers: string[]): boolean {
  const hasCaller = headerIndex(headers, ["caller", "caller id"]) >= 0;
  const hasDur = headerIndex(headers, ["duration"]) >= 0;
  if (!hasCaller || !hasDur) return false;
  const hasQueue = headerIndex(headers, ["queue"]) >= 0;
  const hasWait = headerIndex(headers, ["wait", "wait time"]) >= 0;
  const hasDisc = headerIndex(headers, ["disconnection", "disconnect"]) >= 0;
  const hasPos = headerIndex(headers, ["position"]) >= 0;
  return hasQueue || hasWait || hasDisc || hasPos;
}

export function csvIsQueueAnswered(text: string): boolean {
  const table = parseCsvRows(text);
  if (table.length < 2) return false;
  return isQueueAnsweredCsv(table[findHeaderRow(table)].map(normHeader));
}

function findHeaderRow(table: string[][]): number {
  const max = Math.min(table.length, 20);
  for (let i = 0; i < max; i++) {
    const headers = table[i].map(normHeader);
    const hasDate = headerIndex(headers, ["date", "datetime", "start time"]) >= 0;
    const hasDisp =
      headerIndex(headers, ["disposition", "call status", "result"]) >= 0;
    const hasType = headerIndex(headers, ["call type", "direction"]) >= 0;
    if (hasDate && (hasDisp || hasType || isQueueAnsweredCsv(headers))) return i;
  }
  return 0;
}

function parseDurationCell(raw: string): { min: number; raw: string } {
  const t = raw.trim();
  const hms = t.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (hms) {
    const clock = `${hms[1]}:${hms[2]}:${hms[3]}`;
    return { min: hhmmssToMinutes(clock), raw: clock };
  }
  const hm = t.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    const clock = `${hm[1]}:${hm[2]}:00`;
    return { min: hhmmssToMinutes(clock), raw: clock };
  }
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return { min: 0, raw: t };
  if (Number.isInteger(n)) {
    return { min: Math.round((n / 60) * 10) / 10, raw: t };
  }
  return { min: Math.round(n * 10) / 10, raw: t };
}
function parseDateCell(raw: string): string {
  const t = raw.trim().replace(/^2\.(\d{3}-)/, "2$1");
  const iso = t.match(/(\d{4})[.\/-](\d{2})[.\/-](\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (iso) {
    const hh = iso[4].padStart(2, "0");
    const ss = (iso[6] || "00").padStart(2, "0");
    return `${iso[1]}-${iso[2]}-${iso[3]}T${hh}:${iso[5]}:${ss}`;
  }
  const dmy = t.match(
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
  );
  if (dmy) {
    const dd = dmy[1].padStart(2, "0");
    const mm = dmy[2].padStart(2, "0");
    const ss = (dmy[6] || "00").padStart(2, "0");
    const hh = dmy[4].padStart(2, "0");
    return `${dmy[3]}-${mm}-${dd}T${hh}:${dmy[5]}:${ss}`;
  }
  return "";
}

function normalizeDisposition(disp: string, talkMin: number): string {
  const d = (disp || "")
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (
    d.includes("NO ANSWER") ||
    d.includes("NOANSWER") ||
    d.includes("NOT ANSWER") ||
    d.includes("UNANSWER") ||
    d.includes("MISSED") ||
    d.includes("VOICEMAIL") ||
    d.includes("VOICE MAIL")
  ) {
    return "NO ANSWER";
  }
  if (d.includes("BUSY")) return "BUSY";
  if (d.includes("FAIL") || d.includes("CANCEL") || d.includes("ABANDON") || d.includes("REJECT")) {
    return "FAILED";
  }
  if (d.includes("ANSWER") || d.includes("CONNECT")) return "ANSWERED";
  if (talkMin > 0 && !d) return "ANSWERED";
  return d || "UNKNOWN";
}

function directionOf(type: string | null | undefined): "Inbound" | "Outbound" {
  return type === "Outbound" ? "Outbound" : "Inbound";
}

export function parseTelecomCsv(
  text: string,
  fileDirection: CallType | null,
): TelecomRow[] {
  const generatedBy = extractGeneratedBy(text);
  const table = parseCsvRows(text);
  if (table.length < 2) return [];
  const headerAt = findHeaderRow(table);
  const headers = table[headerAt].map(normHeader);
  const queueAnswered = isQueueAnsweredCsv(headers);
  const iDate = headerIndex(headers, ["date", "datetime", "start time"]);
  const iCaller = headerIndex(headers, [
    "caller id",
    "clid",
    "ani",
    "phone",
    "caller",
  ]);
  const iDest = headerIndex(headers, [
    "destination",
    "dst",
    "called",
    "called number",
    "to number",
    "callee",
    "dialed",
  ]);
  const iDid = headerIndex(headers, ["did"]);
  const iDisp = headerIndex(headers, ["disposition", "call status", "result"]);
  const iType = headerIndex(headers, ["call type", "direction", "type"]);
  const iTalk = headerIndex(headers, ["talk time", "billsec", "talk"]);
  const iDur = headerIndex(headers, ["duration", "total duration", "call duration"]);
  const iAgent = headerIndex(headers, [
    "agent",
    "operator",
    "user",
    "staff",
    "extension name",
  ]);
  const iUid = headerIndex(headers, [
    "unique id",
    "uniqueid",
    "call id",
    "callid",
    "linked id",
    "linkedid",
    "cdr id",
    "recording id",
  ]);
  if (iDate < 0 && iDisp < 0) return [];
  const rows: TelecomRow[] = [];
  for (const cells of table.slice(headerAt + 1)) {
    const joined = cells.join(" ");
    const disp = (
      (iDisp >= 0 ? cells[iDisp] : "") ||
      (joined.match(/\b(NO ANSWER|NOANSWER|NOT ANSWERED|FAILED|BUSY|ANSWERED)\b/i) || [""])[0]
    ).toUpperCase();
    const typeRaw = (iType >= 0 ? cells[iType] : "") || "";
    const kind = typeRaw.toLowerCase();
    if (kind.includes("internal")) continue;
    const datetime = parseDateCell(
      (iDate >= 0 ? cells[iDate] : "") || joined,
    );
    const cellType = typeFromLabel(typeRaw) || typeFromLabel(joined);
    const type: CallType | null =
      fileDirection || cellType || (queueAnswered ? "Inbound" : null);
    if (!type) continue;
    const phoneSrc =
      type === "Outbound"
        ? [iDest >= 0 ? cells[iDest] : "", iCaller >= 0 ? cells[iCaller] : ""].join(
            " ",
          )
        : [iCaller >= 0 ? cells[iCaller] : "", iDest >= 0 ? cells[iDest] : ""].join(
            " ",
          );
    const phone = extractPhone(phoneSrc || joined);
    if (!datetime || phone.length < 7) continue;
    const talk = parseDurationCell(iTalk >= 0 ? cells[iTalk] || "" : "");
    const total = parseDurationCell(iDur >= 0 ? cells[iDur] || "" : "");
    const inboundQueue = queueAnswered && type === "Inbound";
    const disposition = inboundQueue
      ? "ANSWERED"
      : normalizeDisposition(disp, talk.min);
    let dur = talk.min > 0 ? talk : disposition === "ANSWERED" ? total : { min: 0, raw: talk.raw || total.raw };
    if (inboundQueue && dur.min === 0 && total.min > 0) dur = total;
    if (disposition === "ANSWERED" && dur.min === 0) {
      const clocks = joined.match(/\d{1,2}:\d{2}:\d{2}/g) || [];
      const dateRaw = iDate >= 0 ? cells[iDate] || "" : "";
      const extra = clocks.find((c) => !dateRaw.includes(c));
      if (extra) dur = parseDurationCell(extra);
    }
    const agentHint = (iAgent >= 0 ? cells[iAgent] : "") || generatedBy;
    const uid = (iUid >= 0 ? cells[iUid] || "" : "").trim()
      || `${datetime}|${phone}|${type}|${dur.raw}`;
    rows.push({
      datetime,
      phone,
      did: iDid >= 0 ? extractPhone(cells[iDid] || "") : "",
      type,
      durationMin: dur.min,
      durationRaw: dur.raw,
      disposition,
      agentHint: agentHint.trim(),
      agentId: "",
      uid,
    });
  }
  return rows;
}

function minuteKey(datetime: string): string {
  const iso = datetime.includes("T") ? datetime : datetime.replace(" ", "T");
  return iso.slice(0, 16);
}

function isAnsweredDisp(d: string): boolean {
  return d === "ANSWERED";
}

export function crmOutcomeForRow(_row: TelecomRow): "Answered" {
  return "Answered";
}

export function answeredCustomerRows(rows: TelecomRow[]): TelecomRow[] {
  const answered = rows
    .filter((r) => r.disposition === "ANSWERED")
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
  const kept: TelecomRow[] = [];
  for (const row of answered) {
    const t = callTime(row.datetime);
    const hit = kept.findIndex((k) => {
      if (row.uid && k.uid && row.uid === k.uid && k.type === row.type) return true;
      return (
        !row.uid &&
        !k.uid &&
        k.type === row.type &&
        samePhone(k.phone, row.phone) &&
        Math.abs(callTime(k.datetime) - t) <= CSV_DEDUPE_MS
      );
    });
    if (hit < 0) {
      kept.push(row);
      continue;
    }
    if (row.durationMin > kept[hit].durationMin) kept[hit] = row;
  }
  return kept;
}

function samePhone(a: string, b: string): boolean {
  const da = phoneDigits(a);
  const db = phoneDigits(b);
  if (da.length < 8 || db.length < 8) return false;
  if (da === db) return true;
  const a9 = da.slice(-9);
  const b9 = db.slice(-9);
  return a9.length === 9 && a9 === b9;
}

function callTime(value: string): number {
  const t = new Date(
    value.includes("T") ? value : value.replace(" ", "T"),
  ).getTime();
  return Number.isFinite(t) ? t : 0;
}

function phoneTail(phone: string): string {
  const d = phoneDigits(phone);
  return d.length >= 9 ? d.slice(-9) : d;
}

type CallIndex = {
  byPhone: Map<string, Call[]>;
};

function buildCallIndex(data: ZynloData): CallIndex {
  const customersById: Record<string, Customer> = {};
  for (const c of data.customers) customersById[c.id] = c;
  const byPhone = new Map<string, Call[]>();
  for (const call of data.calls) {
    const cu = customersById[call.customerId];
    if (!cu) continue;
    const k = phoneTail(cu.phone);
    if (k.length < 8) continue;
    const arr = byPhone.get(k);
    if (arr) arr.push(call);
    else byPhone.set(k, [call]);
  }
  return { byPhone };
}

function closestCall(
  row: TelecomRow,
  data: ZynloData,
  sameTypeOnly: boolean,
  index?: CallIndex,
  used?: Set<string>,
): Call | undefined {
  const target = callTime(row.datetime);
  if (!target) return undefined;
  const idx = index || buildCallIndex(data);
  const candidates = idx.byPhone.get(phoneTail(row.phone)) || [];
  let best: Call | undefined;
  let bestDelta = CRM_MATCH_MS + 1;
  for (const call of candidates) {
    if (used?.has(call.id)) continue;
    const ct = callTime(call.datetime);
    if (!ct) continue;
    const delta = Math.abs(ct - target);
    if (delta > CRM_MATCH_MS) continue;
    const callDir =
      call.type === "Outbound" ? "Outbound" : call.type === "Inbound" ? "Inbound" : "";
    if (!callDir) continue;
    const rowDir = directionOf(row.type);
    if (sameTypeOnly && callDir !== rowDir) continue;
    if (!sameTypeOnly && callDir === rowDir) continue;
    if (!isAnsweredDisp(row.disposition)) continue;
    if (delta < bestDelta) {
      best = call;
      bestDelta = delta;
    }
  }
  return best;
}

export function matchExistingCall(
  row: TelecomRow,
  data: ZynloData,
  sameTypeOnly = true,
  index?: CallIndex,
  used?: Set<string>,
): Call | undefined {
  return closestCall(row, data, sameTypeOnly, index, used);
}

export function buildReconcilePreviewFromRows(
  filename: string,
  all: TelecomRow[],
  data: ZynloData,
  agents: Agent[] = [],
  fileDirection: CallType | null = null,
  queueAnswered = false,
): ReconcilePreview {
  const answered = answeredCustomerRows(all);
  const callIndex = buildCallIndex(data);
  const already: TelecomRow[] = [];
  const missing: TelecomRow[] = [];
  const directionFixes: DirectionFix[] = [];
  const matchedIds: string[] = [];
  const seen = new Set<string>();

  for (const row of answered) {
    const same = closestCall(row, data, true, callIndex, seen);
    if (same && !seen.has(same.id)) {
      seen.add(same.id);
      matchedIds.push(same.id);
      const fromDuration = Number(same.duration) || 0;
      const toDuration = row.durationMin || 0;
      const durDiff =
        toDuration > 0 && Math.abs(toDuration - fromDuration) >= 0.05;
      if (durDiff) {
        directionFixes.push({
          callId: same.id,
          phone: row.phone,
          datetime: row.datetime,
          from: directionOf(same.type),
          to: directionOf(same.type),
          fromDuration,
          toDuration,
        });
      }
      already.push(row);
      continue;
    }
    missing.push(row);
  }
  const names = [
    ...new Set(
      answered
        .map((r) => {
          const id = r.agentId || matchAgentId(r.agentHint, agents);
          return agents.find((a) => a.id === id)?.name || r.agentHint;
        })
        .filter(Boolean),
    ),
  ];
  const detectedAgentId =
    detectAgentFromFilename(filename, agents) ||
    matchAgentId(names[0] || "", agents);
  const detectedAgentName = names.join(", ");
  const extraIds: string[] = [];
  const matched = new Set(matchedIds);
  const inboundDays = new Set(
    answered
      .filter((r) => r.type === "Inbound")
      .map((r) => (r.datetime || "").slice(0, 10))
      .filter(Boolean),
  );
  const outboundDays = new Set(
    answered
      .filter((r) => r.type === "Outbound")
      .map((r) => (r.datetime || "").slice(0, 10))
      .filter(Boolean),
  );

  const hideUnmatched = (
    dir: "Inbound" | "Outbound",
    days: Set<string>,
  ) => {
    if (days.size === 0) return;
    for (const call of data.calls) {
      if (call.csvCounted === false) continue;
      if (matched.has(call.id)) continue;
      if (call.type !== dir) continue;
      if (call.outcome === "No Answer" || call.outcome === "Voicemail") continue;
      const day = (call.datetime || "").slice(0, 10);
      if (!days.has(day)) continue;
      extraIds.push(call.id);
    }
  };

  const name = (filename || "").toLowerCase();
  const outboundTruth =
    fileDirection === "Outbound" ||
    /\boutgoing\b|\boutbound\b|\bout going\b|\bout-going\b|\bdialled\b|\bdialed\b/.test(
      name,
    );
  const inboundTruth =
    fileDirection !== "Outbound" &&
    (queueAnswered ||
      fileDirection === "Inbound" ||
      /\banswered\s*calls?\b|\bincoming\b|\binbound\b/.test(name));
  const mixedBatch = inboundDays.size > 0 && outboundDays.size > 0;
  const onlyOutbound = outboundDays.size > 0 && inboundDays.size === 0;
  const onlyInbound = inboundDays.size > 0 && outboundDays.size === 0;

  // CSV answered rows are the cap for that direction on those days.
  // Outgoing files without "outgoing" in the name still cap outbound.
  if (inboundTruth || mixedBatch || onlyInbound) hideUnmatched("Inbound", inboundDays);
  if (outboundTruth || mixedBatch || onlyOutbound) hideUnmatched("Outbound", outboundDays);
  return {
    filename,
    answered: answered.length,
    skipped: Math.max(0, all.length - answered.length),
    already,
    missing,
    missingInbound: missing.filter((r) => r.type === "Inbound"),
    missingOutbound: missing.filter((r) => r.type === "Outbound"),
    alreadyInbound: already.filter((r) => r.type === "Inbound").length,
    alreadyOutbound: already.filter((r) => r.type === "Outbound").length,
    directionFixes,
    matchedIds,
    detectedAgentId,
    detectedAgentName,
    detectedDirection: fileDirection,
    extraIds,
  };
}

export function buildReconcilePreview(
  filename: string,
  text: string,
  data: ZynloData,
  agents: Agent[] = [],
): ReconcilePreview {
  const dir = detectCallDirection(filename, text);
  const queue = looksLikeCsv(text) && csvIsQueueAnswered(text);
  const fileDir = dir || (queue ? "Inbound" : null);
  const all = looksLikeCsv(text)
    ? parseTelecomCsv(text, fileDir)
    : parseTelecomText(text, fileDir);
  return buildReconcilePreviewFromRows(filename, all, data, agents, fileDir, queue);
}

export async function extractPdfText(file: File | ArrayBuffer): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF reading is only available in the browser");
  }
  const pdfjs = await import("pdfjs-dist");
  const workerMod = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  const workerSrc =
    typeof workerMod.default === "string"
      ? workerMod.default
      : String(workerMod.default || "");
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const data =
    file instanceof File
      ? new Uint8Array(await file.arrayBuffer())
      : new Uint8Array(file);
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line: string[] = [];
    for (const item of content.items) {
      if ("str" in item && item.str) line.push(item.str);
    }
    pages.push(line.join("\n"));
  }
  return pages.join("\n");
}

function stampAgents(
  rows: TelecomRow[],
  file: File,
  generatedBy: string,
  agents: Agent[],
): TelecomRow[] {
  const fromFile = detectAgentFromFilename(file.name, agents);
  const fromGen = matchAgentId(generatedBy, agents);
  const fileAgentId = fromFile || fromGen;
  const fileHint =
    agents.find((a) => a.id === fileAgentId)?.name || generatedBy;
  return rows.map((r) => {
    const fromRow = matchAgentId(r.agentHint, agents);
    const agentId = fromRow || fileAgentId;
    return {
      ...r,
      agentId,
      agentHint: r.agentHint || fileHint,
    };
  });
}

export async function parseTelecomFile(
  file: File,
  agents: Agent[] = [],
): Promise<TelecomParse> {
  const name = file.name.toLowerCase();
  if (
    name.endsWith(".csv") ||
    file.type.includes("csv") ||
    file.type.includes("excel")
  ) {
    const text = await file.text();
    const queueAnswered = csvIsQueueAnswered(text);
    const fileDirection =
      detectCallDirection(file.name, text) ||
      (queueAnswered ? "Inbound" : null);
    const generatedBy = extractGeneratedBy(text);
    return {
      rows: stampAgents(
        parseTelecomCsv(text, fileDirection),
        file,
        generatedBy,
        agents,
      ),
      generatedBy,
      fileDirection,
      queueAnswered,
    };
  }
  const text = await extractPdfText(file);
  const fileDirection = detectCallDirection(file.name, text);
  const generatedBy = extractGeneratedBy(text);
  return {
    rows: stampAgents(
      parseTelecomText(text, fileDirection),
      file,
      generatedBy,
      agents,
    ),
    generatedBy,
    fileDirection,
  };
}

export function customerForRow(
  customers: Customer[],
  phone: string,
): Customer | undefined {
  return findCustomerByPhone(customers, phone);
}
