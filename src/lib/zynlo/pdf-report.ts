import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Agent, Call, Client, Customer, Message } from "./types";
import {
  countsAsInbound,
  countsAsOutbound,
  countsInCallLog,
  formatDate,
  formatDuration,
  handleMinutes,
  getFollowUpItems,
  periodQa,
  qaScore,
  formatQa,
  resolutionOf,
  todayStr,
} from "./utils";

const PURPLE = { r: 167, g: 67, b: 255 };
const INK = { r: 45, g: 27, b: 78 };
const MUTED = { r: 110, g: 90, b: 140 };
const LINE = { r: 228, g: 214, b: 245 };
const WASH = { r: 248, g: 244, b: 252 };
const WHITE = { r: 255, g: 255, b: 255 };

let logoCache: string | null = null;

async function loadLogo(): Promise<string | null> {
  if (logoCache) return logoCache;
  try {
    const res = await fetch("/logo-wordmark.png", { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    logoCache = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return logoCache;
  } catch {
    return null;
  }
}

function periodLabel(): { start: string; end: string; pretty: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 13);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return {
    start: fmt(start),
    end: fmt(end),
    pretty: `${fmt(start)} to ${fmt(end)}`,
  };
}

function safeFile(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40);
}

export async function downloadClientPdf(opts: {
  client: Client;
  contacts: Customer[];
  calls: Call[];
  messages: Message[];
  agentsById: Record<string, Agent>;
  customersById: Record<string, Customer>;
}): Promise<void> {
  const { client, contacts, messages, agentsById, customersById } = opts;
  const calls = opts.calls.filter(countsInCallLog);
  const logo = await loadLogo();
  const period = periodLabel();
  const qa = periodQa(calls, 4000);
  const inbound = calls.filter(countsAsInbound).length;
  const outbound = calls.filter(countsAsOutbound).length;
  const res = resolutionOf(calls);
  const resolved = res.resolved;
  const escalated = calls.filter((c) => c.outcome === "Escalated").length;
  const follow = calls.filter((c) => c.outcome === "Follow-up").length;
  const openFollow = getFollowUpItems({
    agents: [],
    customers: contacts,
    clients: [client],
    calls,
    messages,
  }).length;
  const timed = calls.filter((c) => (c.duration || 0) > 0);
  const aht = timed.length
    ? timed.reduce((s, c) => s + handleMinutes(c.duration), 0) / timed.length
    : 0;
  const resolution = res.percent;
  const generated = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const docId = `ZYN-${todayStr().replace(/-/g, "")}-${client.id.slice(-6).toUpperCase()}`;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;

  const drawHeader = (page: number) => {
    doc.setFillColor(INK.r, INK.g, INK.b);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setFillColor(PURPLE.r, PURPLE.g, PURPLE.b);
    doc.rect(0, 22, pageW, 1.2, "F");
    if (logo) {
      try {
        doc.addImage(logo, "PNG", margin, 5.2, 38, 11);
      } catch {
        doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("ZYNLO", margin, 14);
      }
    } else {
      doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("ZYNLO", margin, 14);
    }
    doc.setTextColor(255, 230, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("CONTACT CENTRE  ·  CONFIDENTIAL", pageW - margin, 13.5, {
      align: "right",
    });

    doc.setFillColor(WASH.r, WASH.g, WASH.b);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setDrawColor(LINE.r, LINE.g, LINE.b);
    doc.setLineWidth(0.2);
    doc.line(0, pageH - 12, pageW, pageH - 12);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Document ${docId}`, margin, pageH - 5);
    doc.text("Zynlo  ·  Client confidential", pageW / 2, pageH - 5, {
      align: "center",
    });
    doc.text(`Page ${page}`, pageW - margin, pageH - 5, { align: "right" });
  };

  drawHeader(1);

  let y = 32;
  doc.setTextColor(PURPLE.r, PURPLE.g, PURPLE.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("OPERATIONS PERFORMANCE REPORT", margin, y);

  y += 8;
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const title = doc.splitTextToSize(client.name, pageW - margin * 2);
  doc.text(title, margin, y);
  y += title.length * 8 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`Service period  ${period.pretty}`, margin, y);
  y += 5;
  doc.text(`Prepared by Zynlo  ·  Generated ${generated}`, margin, y);
  y += 8;

  // Meta strip
  doc.setFillColor(WASH.r, WASH.g, WASH.b);
  doc.roundedRect(margin, y, pageW - margin * 2, 14, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const metas = [
    ["Classification", "Confidential"],
    ["Status", client.status || "Active"],
    ["Industry", client.industry || "Not specified"],
    ["Contacts", String(contacts.length)],
  ];
  const slot = (pageW - margin * 2) / metas.length;
  metas.forEach(([k, v], i) => {
    const x = margin + 4 + i * slot;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(k.toUpperCase(), x, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(v, x, y + 10.5);
  });
  y += 22;

  // KPI tiles
  const kpis: [string, string][] = [
    ["Calls", String(calls.length)],
    ["Messages", String(messages.length)],
    ["Resolved", `${resolution}%`],
    ["Avg handle", formatDuration(aht)],
    ["QA score", qa.rated ? `${formatQa(qa.avg)} / 10` : "-"],
    ["Open follow-ups", String(openFollow)],
  ];
  const gap = 3;
  const tileW = (pageW - margin * 2 - gap * 2) / 3;
  const tileH = 18;
  kpis.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (tileW + gap);
    const ty = y + row * (tileH + gap);
    doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
    doc.setDrawColor(LINE.r, LINE.g, LINE.b);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, ty, tileW, tileH, 1.2, 1.2, "FD");
    doc.setFillColor(PURPLE.r, PURPLE.g, PURPLE.b);
    doc.rect(x, ty, 1.4, tileH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(label.toUpperCase(), x + 5, ty + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(value, x + 5, ty + 13.5);
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Handle time is talk time plus 25% after-call work.", margin, y + tileH * 2 + gap + 4);
  y += tileH * 2 + gap + 14;

  // Narrative
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.text("Executive summary", margin, y);
  y += 6;
  const narrative = [
    `Zynlo handled ${calls.length} call${calls.length === 1 ? "" : "s"} and ${messages.length} message${messages.length === 1 ? "" : "s"} for ${client.name} in this 14-day period.`,
    `Direction mix: ${inbound} inbound, ${outbound} outbound. Outcomes: ${resolved} resolved, ${escalated} escalated, ${follow} follow-up.`,
    qa.rated
      ? `Quality assurance averaged ${formatQa(qa.avg)} from ${qa.rated} scored call${qa.rated === 1 ? "" : "s"} in the period.`
      : "No scored quality reviews were recorded in this period.",
    openFollow
      ? `${openFollow} item${openFollow === 1 ? " remains" : "s remain"} open for follow-up.`
      : "No open follow-up items at the time of this report.",
  ].join(" ");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(45, 27, 78);
  const wrapped = doc.splitTextToSize(narrative, pageW - margin * 2);
  doc.text(wrapped, margin, y);
  y += wrapped.length * 4.4 + 8;

  if (client.notes?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Account notes", margin, y);
    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notes = doc.splitTextToSize(client.notes.trim(), pageW - margin * 2);
    doc.text(notes.slice(0, 8), margin, y);
    y += Math.min(notes.length, 8) * 4.2 + 6;
  }

  const tableHead = {
    fillColor: [INK.r, INK.g, INK.b] as [number, number, number],
    textColor: 255,
    fontStyle: "bold" as const,
    fontSize: 7.5,
    cellPadding: 2.2,
  };
  const tableBody = {
    textColor: [INK.r, INK.g, INK.b] as [number, number, number],
    fontSize: 7.5,
    cellPadding: 2,
  };
  const alt = { fillColor: [WASH.r, WASH.g, WASH.b] as [number, number, number] };

  const afterTable = (hook: { pageNumber: number }) => {
    drawHeader(hook.pageNumber);
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.text("Customer directory", margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { top: 28, left: margin, right: margin, bottom: 16 },
    head: [["Name", "Phone", "Email", "Calls", "Messages"]],
    body: contacts.length
      ? contacts.map((cu) => [
          cu.name || "Unknown",
          cu.phone || "-",
          cu.email || "-",
          String(calls.filter((c) => c.customerId === cu.id).length),
          String(messages.filter((m) => m.customerId === cu.id).length),
        ])
      : [["No customers in this period", "", "", "", ""]],
    theme: "plain",
    styles: { font: "helvetica", overflow: "linebreak", valign: "middle" },
    headStyles: tableHead,
    bodyStyles: tableBody,
    alternateRowStyles: alt,
    didDrawPage: afterTable,
  });

  const afterContacts = (
    doc as unknown as { lastAutoTable: { finalY: number } }
  ).lastAutoTable.finalY;

  let y2 = afterContacts + 10;
  if (y2 > pageH - 40) {
    doc.addPage();
    y2 = 32;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.text("Call register", margin, y2);
  autoTable(doc, {
    startY: y2 + 3,
    margin: { top: 28, left: margin, right: margin, bottom: 16 },
    head: [
      [
        "When",
        "Customer",
        "Phone",
        "Type",
        "Agent",
        "Handle",
        "Outcome",
        "QA",
        "Notes",
      ],
    ],
    body: calls.length
      ? calls.map((c) => {
          const cu = customersById[c.customerId];
          return [
            formatDate(c.datetime),
            cu?.name || "Unknown",
            cu?.phone || "-",
            c.type || "Inbound",
            agentsById[c.agentId]?.name || "-",
            formatDuration(handleMinutes(c.duration)),
            c.outcome,
            qaScore(c) != null ? String(qaScore(c)) : "-",
            (c.notes || "").slice(0, 90),
          ];
        })
      : [["No calls in this period", "", "", "", "", "", "", "", ""]],
    theme: "plain",
    styles: { font: "helvetica", overflow: "linebreak", valign: "middle" },
    headStyles: tableHead,
    bodyStyles: tableBody,
    alternateRowStyles: alt,
    columnStyles: {
      0: { cellWidth: 28 },
      2: { cellWidth: 24 },
      5: { cellWidth: 16 },
      7: { cellWidth: 10 },
      8: { cellWidth: 32 },
    },
    didDrawPage: afterTable,
  });

  const afterCalls = (
    doc as unknown as { lastAutoTable: { finalY: number } }
  ).lastAutoTable.finalY;

  let y3 = afterCalls + 10;
  if (y3 > pageH - 40) {
    doc.addPage();
    y3 = 32;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.text("Message register", margin, y3);
  autoTable(doc, {
    startY: y3 + 3,
    margin: { top: 28, left: margin, right: margin, bottom: 16 },
    head: [
      ["When", "Customer", "Phone", "Channel", "Dir", "Agent", "Status", "Detail"],
    ],
    body: messages.length
      ? messages.map((m) => {
          const cu = customersById[m.customerId];
          return [
            formatDate(m.datetime),
            cu?.name || "Unknown",
            cu?.phone || "-",
            m.channel,
            m.direction,
            agentsById[m.agentId]?.name || "-",
            m.status,
            (m.notes || m.body || "").slice(0, 80),
          ];
        })
      : [["No messages in this period", "", "", "", "", "", "", ""]],
    theme: "plain",
    styles: { font: "helvetica", overflow: "linebreak", valign: "middle" },
    headStyles: tableHead,
    bodyStyles: tableBody,
    alternateRowStyles: alt,
    didDrawPage: afterTable,
  });

  // Section titles for tables: draw before each via willDrawPage is hard.
  // Add a closing statement page footer already handled.

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    drawHeader(i);
  }

  // Section labels as small captions above tables is already in exec summary.
  doc.save(`Zynlo_${safeFile(client.name)}_Report_${todayStr()}.pdf`);
}
