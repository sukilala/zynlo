import type { Agent, Call, Client, Customer, Message, ZynloData } from "./types";

export function formatDate(d: string | undefined | null): string {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(mins: number): string {
  if (!mins && mins !== 0) return "-";
  if (mins < 1) return `${Math.round(mins * 60)}s`;
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function todayStr(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function getInitials(name: string): string {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function agentMap(data: ZynloData): Record<string, Agent> {
  const m: Record<string, Agent> = {};
  for (const a of data.agents) m[a.id] = a;
  return m;
}

export function customerMap(data: ZynloData): Record<string, Customer> {
  const m: Record<string, Customer> = {};
  for (const c of data.customers) m[c.id] = c;
  return m;
}

export function clientMap(data: ZynloData): Record<string, Client> {
  const m: Record<string, Client> = {};
  for (const c of data.clients) m[c.id] = c;
  return m;
}

/** Resolve display company for a customer: linked client name > free-text company */
export function customerCompanyLabel(
  customer: Customer | undefined,
  clients: Record<string, Client>,
): string {
  if (!customer) return "-";
  if (customer.clientId && clients[customer.clientId]) {
    return clients[customer.clientId].name;
  }
  return customer.company || "-";
}

/** Digits only from a phone string. */
export function phoneDigits(phone: string | undefined | null): string {
  return (phone || "").replace(/\D/g, "");
}

/** Telecom reconcile rows must not move resolution rate. */
export function countsForResolution(c: {
  outcome?: string;
  source?: string | null;
}): boolean {
  if (c.source === "telecom") return false;
  if (c.outcome === "Answered") return false;
  return true;
}

export function resolutionOf(
  calls: Array<{ outcome?: string; source?: string | null }>,
) {
  const eligible = calls.filter(countsForResolution);
  const resolved = eligible.filter((c) => c.outcome === "Resolved").length;
  return {
    eligible: eligible.length,
    resolved,
    rate: eligible.length ? resolved / eligible.length : 0,
    percent: eligible.length
      ? Math.round((resolved / eligible.length) * 100)
      : 0,
  };
}

export function callRating(c: {
  rating?: number | string | null;
  ratingScale?: 5 | 10 | null;
}): number | null {
  if (c.rating == null || c.rating === "") return null;
  const n = Number(c.rating);
  if (!Number.isFinite(n) || n <= 0) return null;
  const out = c.ratingScale === 10 || n > 5 ? n : n * 2;
  return Math.round(Math.min(10, out) * 10) / 10;
}

/**
 * Match a customer by phone. Prefer exact digit match (min 7 digits).
 */
export function findCustomerByPhone(
  customers: Customer[],
  phone: string,
): Customer | undefined {
  const digits = phoneDigits(phone);
  if (digits.length < 8) return undefined;
  const exact = customers.find((c) => phoneDigits(c.phone) === digits);
  if (exact) return exact;
  const want = digits.length >= 9 ? digits.slice(-9) : digits;
  if (want.length < 8) return undefined;
  return customers.find((c) => {
    const d = phoneDigits(c.phone);
    if (d.length < 8) return false;
    const got = d.length >= 9 ? d.slice(-9) : d;
    return got === want;
  });
}

export function getAgentStats(data: ZynloData, agentId: string) {
  const agentCalls = data.calls.filter((c) => c.agentId === agentId);
  const agentMsgs = (data.messages || []).filter((m) => m.agentId === agentId);
  const today = todayStr();
  const todayCallsList = agentCalls.filter((c) =>
    c.datetime?.startsWith(today),
  );
  const todayMsgsList = agentMsgs.filter((m) => m.datetime?.startsWith(today));
  const total = agentCalls.length;
  const resAll = resolutionOf(agentCalls);
  const resolved = resAll.resolved;
  const ratedScores = agentCalls
    .map(callRating)
    .filter((n): n is number => n != null);
  const timedAll = agentCalls.filter((c) => (c.duration || 0) > 0);
  const avgDuration = timedAll.length
    ? timedAll.reduce((s, c) => s + (c.duration || 0), 0) / timedAll.length
    : 0;
  const csat = ratedScores.length
    ? ratedScores.reduce((s, n) => s + n, 0) / ratedScores.length
    : 0;
  const resToday = resolutionOf(todayCallsList);
  const todayResolved = resToday.resolved;
  const timedToday = todayCallsList.filter((c) => (c.duration || 0) > 0);
  const todayAvgDuration = timedToday.length
    ? timedToday.reduce((s, c) => s + (c.duration || 0), 0) / timedToday.length
    : 0;
  const todayRatedScores = todayCallsList
    .map(callRating)
    .filter((n): n is number => n != null);
  const todayCsat = todayRatedScores.length
    ? todayRatedScores.reduce((s, n) => s + n, 0) / todayRatedScores.length
    : 0;
  const week = rangeQa(agentCalls, startOfWeekStr(0), todayStr());
  const lastWeek = rangeQa(
    agentCalls,
    startOfWeekStr(-1),
    dateOffsetFrom(startOfWeekStr(0), -1),
  );
  return {
    total,
    messages: agentMsgs.length,
    todayCalls: todayCallsList.length,
    todayMessages: todayMsgsList.length,
    todayAvgDuration,
    todayResolutionRate: resToday.rate,
    todayCsat,
    ratedCount: ratedScores.length,
    todayRatedCount: todayRatedScores.length,
    resolved,
    resolutionRate: resAll.rate,
    avgDuration,
    csat,
    openFollowUps:
      agentCalls.filter(
        (c) => c.outcome === "Follow-up" || c.outcome === "Escalated",
      ).length +
      agentMsgs.filter((m) => m.status === "Open" || m.status === "Pending")
        .length,
    weekQa: week.avg,
    weekRated: week.rated,
    lastWeekQa: lastWeek.avg,
    lastWeekRated: lastWeek.rated,
  };
}

export function getCustomerStats(data: ZynloData, customerId: string) {
  const custCalls = data.calls
    .filter((c) => c.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );
  const custMsgs = (data.messages || [])
    .filter((m) => m.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );
  const lastCall = custCalls[0] as Call | undefined;
  const lastMsg = custMsgs[0] as Message | undefined;
  let lastContact = lastCall?.datetime;
  if (lastMsg && (!lastContact || lastMsg.datetime > lastContact)) {
    lastContact = lastMsg.datetime;
  }
  return {
    total: custCalls.length,
    messages: custMsgs.length,
    lastCall,
    lastMessage: lastMsg,
    lastContact,
    resolved: custCalls.filter((c) => c.outcome === "Resolved").length,
    escalated: custCalls.filter((c) => c.outcome === "Escalated").length,
    avgDuration: (() => {
      const timed = custCalls.filter((c) => (c.duration || 0) > 0);
      return timed.length
        ? timed.reduce((s, c) => s + (c.duration || 0), 0) / timed.length
        : 0;
    })(),
    qaScore: (() => {
      const rated = custCalls.map(callRating).filter((n): n is number => n != null);
      return rated.length
        ? rated.reduce((s, n) => s + n, 0) / rated.length
        : 0;
    })(),
    // Notes only from call log + messages (not free-form customer profile notes)
    activityNotes: (() => {
      const items: Array<{ t: string; n: string }> = [];
      for (const c of custCalls) {
        if (c.notes?.trim()) items.push({ t: c.datetime, n: c.notes.trim() });
      }
      for (const m of custMsgs) {
        if (m.notes?.trim()) items.push({ t: m.datetime, n: m.notes.trim() });
      }
      items.sort(
        (a, b) => new Date(b.t).getTime() - new Date(a.t).getTime(),
      );
      return items.map((x) => x.n).join(" | ");
    })(),
    callNotes: custCalls
      .filter((c) => c.notes)
      .map((c) => c.notes)
      .join(" | "),
  };
}

export function getClientStats(data: ZynloData, clientId: string) {
  const client = data.clients.find((c) => c.id === clientId);
  const contacts = data.customers.filter((c) => c.clientId === clientId);
  const contactIds = new Set(contacts.map((c) => c.id));

  // Calls/messages linked by clientId OR by a customer who belongs to this client
  const calls = data.calls
    .filter(
      (c) => c.clientId === clientId || contactIds.has(c.customerId),
    )
    .slice()
    .sort(
      (a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );
  const messages = (data.messages || [])
    .filter(
      (m) => m.clientId === clientId || contactIds.has(m.customerId),
    )
    .slice()
    .sort(
      (a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );

  const resolved = calls.filter((c) => c.outcome === "Resolved").length;
  const escalated = calls.filter((c) => c.outcome === "Escalated").length;
  const followUp = calls.filter((c) => c.outcome === "Follow-up").length;
  const rated = calls.map(callRating).filter((n): n is number => n != null);
  const timed = calls.filter((c) => (c.duration || 0) > 0);
  const avgDuration = timed.length
    ? timed.reduce((s, c) => s + (c.duration || 0), 0) / timed.length
    : 0;
  const avgQa = rated.length
    ? rated.reduce((s, n) => s + n, 0) / rated.length
    : 0;

  const noteItems: Array<{ t: string; n: string }> = [];
  if (client?.notes?.trim()) {
    noteItems.push({ t: "9999", n: client.notes.trim() });
  }
  for (const c of calls) {
    if (c.notes?.trim()) noteItems.push({ t: c.datetime, n: c.notes.trim() });
  }
  for (const m of messages) {
    if (m.notes?.trim()) noteItems.push({ t: m.datetime, n: m.notes.trim() });
  }
  noteItems.sort(
    (a, b) => new Date(b.t).getTime() - new Date(a.t).getTime(),
  );

  let lastActivity: string | undefined;
  if (calls[0]?.datetime) lastActivity = calls[0].datetime;
  if (
    messages[0]?.datetime &&
    (!lastActivity || messages[0].datetime > lastActivity)
  ) {
    lastActivity = messages[0].datetime;
  }

  return {
    contacts: contacts.length,
    contactList: contacts,
    calls: calls.length,
    callList: calls,
    messages: messages.length,
    messageList: messages,
    resolved,
    escalated,
    followUp,
    avgDuration,
    avgQa,
    lastCall: calls[0],
    lastActivity,
    accountNotes: client?.notes || "",
    activityNotes: noteItems
      .filter((x) => x.t !== "9999")
      .map((x) => x.n)
      .join(" | "),
    allNotes: noteItems.map((x) => x.n).join(" | "),
  };
}

/** Calls/messages within the last `days` days (for bi-weekly client reports). */
export function filterSinceDatetime<T extends { datetime: string }>(
  items: T[],
  days: number,
): T[] {
  const cut = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    const t = new Date(item.datetime).getTime();
    return !Number.isNaN(t) && t >= cut;
  });
}

export function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function escapeCsv(val: unknown): string {
  const s = val == null ? "" : String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function localDatetimeValue(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Truncate long notes for table cells */
export function shortNotes(text: string, max = 60): string {
  const t = (text || "").trim();
  if (!t) return "-";
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

export function ymd(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function dateOffsetStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return ymd(d);
}

export function dateOffsetFrom(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return ymd(d);
}

/** Monday of the week, offsetWeeks=0 this week, -1 last week. */
export function startOfWeekStr(offsetWeeks = 0): string {
  const d = new Date();
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset + offsetWeeks * 7);
  return ymd(d);
}

export function rangeQa(calls: Call[], from: string, to: string) {
  const list = calls.filter((c) => {
    const d = (c.datetime || "").slice(0, 10);
    return d >= from && d <= to;
  });
  const scores = list.map(callRating).filter((n): n is number => n != null);
  return {
    count: list.length,
    rated: scores.length,
    avg: scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0,
  };
}

export function periodQa(calls: Call[], days: number) {
  const list = filterSinceDatetime(calls, days);
  const scores = list.map(callRating).filter((n): n is number => n != null);
  return {
    count: list.length,
    rated: scores.length,
    avg: scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0,
  };
}

export type FollowUpItem = {
  id: string;
  kind: "call" | "message";
  datetime: string;
  due: string;
  overdue: boolean;
  hasDueDate: boolean;
  agentId: string;
  customerId: string;
  clientId: string | null;
  label: string;
  notes: string;
};

export function getFollowUpItems(data: ZynloData): FollowUpItem[] {
  const today = todayStr();
  const items: FollowUpItem[] = [];
  for (const c of data.calls) {
    if (c.outcome !== "Follow-up" && c.outcome !== "Escalated") continue;
    const hasDueDate = Boolean(c.followUpAt);
    const due = hasDueDate ? String(c.followUpAt).slice(0, 10) : "";
    items.push({
      id: c.id,
      kind: "call",
      datetime: c.datetime,
      due,
      overdue: hasDueDate && due < today,
      hasDueDate,
      agentId: c.agentId,
      customerId: c.customerId,
      clientId: c.clientId,
      label: c.outcome,
      notes: c.notes || "",
    });
  }
  for (const m of data.messages || []) {
    if (m.status !== "Open" && m.status !== "Pending") continue;
    const hasDueDate = Boolean(m.followUpAt);
    const due = hasDueDate ? String(m.followUpAt).slice(0, 10) : "";
    items.push({
      id: m.id,
      kind: "message",
      datetime: m.datetime,
      due,
      overdue: hasDueDate && due < today,
      hasDueDate,
      agentId: m.agentId,
      customerId: m.customerId,
      clientId: m.clientId,
      label: `${m.channel} · ${m.status}`,
      notes: m.notes || m.body || "",
    });
  }
  items.sort((a, b) => {
    const ar = a.overdue ? 0 : a.hasDueDate && a.due === today ? 1 : 2;
    const br = b.overdue ? 0 : b.hasDueDate && b.due === today ? 1 : 2;
    if (ar !== br) return ar - br;
    const ad = a.due || a.datetime;
    const bd = b.due || b.datetime;
    return ad.localeCompare(bd);
  });
  return items;
}

/** Open work only: overdue, due today, or no date yet. Hides future snoozed items. */
export function getActionableFollowUps(data: ZynloData): FollowUpItem[] {
  const today = todayStr();
  return getFollowUpItems(data).filter((f) => {
    if (!f.hasDueDate) return true;
    return f.due <= today;
  });
}

export function getUnratedRecent(data: ZynloData, days = 14): Call[] {
  return filterSinceDatetime(data.calls, days)
    .filter((c) => c.source !== "telecom" && c.outcome !== "Answered")
    .filter((c) => callRating(c) == null)
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );
}

export type FollowUpGroup = {
  key: string;
  customerId: string;
  items: FollowUpItem[];
};

export function groupFollowUps(
  items: FollowUpItem[],
): FollowUpGroup[] {
  const map = new Map<string, FollowUpGroup>();
  for (const item of items) {
    const key = item.customerId || item.id;
    const g = map.get(key);
    if (g) g.items.push(item);
    else map.set(key, { key, customerId: item.customerId, items: [item] });
  }
  return Array.from(map.values());
}

export type UnratedGroup = {
  key: string;
  customerId: string;
  calls: Call[];
};

export function groupUnratedCalls(calls: Call[]): UnratedGroup[] {
  const map = new Map<string, UnratedGroup>();
  for (const c of calls) {
    const key = c.customerId || c.id;
    const g = map.get(key);
    if (g) g.calls.push(c);
    else map.set(key, { key, customerId: c.customerId, calls: [c] });
  }
  return Array.from(map.values());
}

export type TimelineItem = {
  id: string;
  kind: "call" | "message";
  datetime: string;
  title: string;
  detail: string;
  notes: string;
  rating: number | null;
};

export function customerTimeline(
  data: ZynloData,
  customerId: string,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const c of data.calls.filter((x) => x.customerId === customerId)) {
    items.push({
      id: c.id,
      kind: "call",
      datetime: c.datetime,
      title: `${c.type} · ${c.outcome}`,
      detail: formatDuration(c.duration),
      notes: c.notes || "",
      rating: callRating(c),
    });
  }
  for (const m of (data.messages || []).filter((x) => x.customerId === customerId)) {
    items.push({
      id: m.id,
      kind: "message",
      datetime: m.datetime,
      title: `${m.channel} · ${m.direction} · ${m.status}`,
      detail: m.subject || "",
      notes: (m.notes || m.body || "").trim(),
      rating: null,
    });
  }
  items.sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
  );
  return items;
}

export function customersSharingPhone(
  customers: Customer[],
  phone: string,
  exceptId?: string,
): Customer[] {
  const digits = phoneDigits(phone);
  if (digits.length < 7) return [];
  return customers.filter((c) => {
    if (exceptId && c.id === exceptId) return false;
    return phoneDigits(c.phone) === digits;
  });
}
