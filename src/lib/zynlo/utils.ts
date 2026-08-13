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

export function callRating(c: { rating?: number | string | null }): number | null {
  if (c.rating == null || c.rating === "") return null;
  const n = Number(c.rating);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Match a customer by phone. Prefer exact digit match (min 7 digits).
 */
export function findCustomerByPhone(
  customers: Customer[],
  phone: string,
): Customer | undefined {
  const digits = phoneDigits(phone);
  if (digits.length < 7) return undefined;
  const exact = customers.find((c) => phoneDigits(c.phone) === digits);
  if (exact) return exact;
  return customers.find((c) => {
    const d = phoneDigits(c.phone);
    if (d.length < 7) return false;
    if (d === digits) return true;
    const longer = d.length >= digits.length ? d : digits;
    const shorter = d.length >= digits.length ? digits : d;
    if (!longer.endsWith(shorter)) return false;
    const prefixLen = longer.length - shorter.length;
    return prefixLen > 0 && prefixLen <= 3;
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
  const resolved = agentCalls.filter((c) => c.outcome === "Resolved").length;
  const ratedScores = agentCalls
    .map(callRating)
    .filter((n): n is number => n != null);
  const avgDuration = total
    ? agentCalls.reduce((s, c) => s + (c.duration || 0), 0) / total
    : 0;
  const csat = ratedScores.length
    ? ratedScores.reduce((s, n) => s + n, 0) / ratedScores.length
    : 0;
  const todayResolved = todayCallsList.filter(
    (c) => c.outcome === "Resolved",
  ).length;
  const todayAvgDuration = todayCallsList.length
    ? todayCallsList.reduce((s, c) => s + (c.duration || 0), 0) /
      todayCallsList.length
    : 0;
  const todayRatedScores = todayCallsList
    .map(callRating)
    .filter((n): n is number => n != null);
  const todayCsat = todayRatedScores.length
    ? todayRatedScores.reduce((s, n) => s + n, 0) / todayRatedScores.length
    : 0;
  return {
    total,
    messages: agentMsgs.length,
    todayCalls: todayCallsList.length,
    todayMessages: todayMsgsList.length,
    todayAvgDuration,
    todayResolutionRate: todayCallsList.length
      ? todayResolved / todayCallsList.length
      : 0,
    todayCsat,
    ratedCount: ratedScores.length,
    todayRatedCount: todayRatedScores.length,
    resolved,
    resolutionRate: total ? resolved / total : 0,
    avgDuration,
    csat,
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
    avgDuration: custCalls.length
      ? custCalls.reduce((s, c) => s + (c.duration || 0), 0) / custCalls.length
      : 0,
    qaScore: (() => {
      const rated = custCalls.filter((c) => c.rating != null);
      return rated.length
        ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length
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
  const clientNameKey = (client?.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const contacts = data.customers.filter((c) => {
    if (c.clientId === clientId) return true;
    // legacy: free-text company matches client name
    if (
      clientNameKey &&
      (c.company || "").toLowerCase().replace(/[^a-z0-9]/g, "") ===
        clientNameKey
    ) {
      return true;
    }
    return false;
  });
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
  const rated = calls.filter((c) => c.rating != null);
  const avgDuration = calls.length
    ? calls.reduce((s, c) => s + (c.duration || 0), 0) / calls.length
    : 0;
  const avgQa = rated.length
    ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length
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
