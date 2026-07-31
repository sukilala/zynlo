import type { Agent, Call, Customer, ZynloData } from "./types";

export function formatDate(d: string | undefined | null): string {
  if (!d) return "—";
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
  if (!mins && mins !== 0) return "—";
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

export function getAgentStats(data: ZynloData, agentId: string) {
  const agentCalls = data.calls.filter((c) => c.agentId === agentId);
  const total = agentCalls.length;
  const resolved = agentCalls.filter((c) => c.outcome === "Resolved").length;
  const rated = agentCalls.filter((c) => c.rating != null);
  const avgDuration = total
    ? agentCalls.reduce((s, c) => s + (c.duration || 0), 0) / total
    : 0;
  const csat = rated.length
    ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length
    : 0;
  return {
    total,
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
  return {
    total: custCalls.length,
    lastCall: custCalls[0] as Call | undefined,
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
    lastContact: custCalls[0]?.datetime,
    callNotes: custCalls
      .filter((c) => c.notes)
      .map((c) => c.notes)
      .join(" | "),
  };
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
