import { o as __toESM } from "../_runtime.mjs";
import { N as require_react, h as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { _ as ClipboardList, a as Trash2, c as Plus, d as MessageSquare, f as Menu, g as Download, h as FileText, i as TrendingUp, l as Phone, m as FileUp, n as Users, o as Star, p as LayoutDashboard, r as UserRound, s as Search, t as X, u as Pencil, v as ChartColumn, y as Building2 } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as BarChart, o as Line, r as LineChart, s as CartesianGrid, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { t as autoTable } from "../_libs/jspdf-autotable.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BOUeZNBV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = require_jspdf_node_min();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAllData = createServerFn({ method: "GET" }).handler(createSsrRpc("7a0b35f97bc22a1926b37460e302eefd4d59c949892cf5d551f57fe0e0cc6c99"));
createServerFn({ method: "GET" }).handler(createSsrRpc("0ac55d47f0342569c31a58a5ac369acfe1da2b2c9ec26c3d010af713150b8734"));
var saveAgent = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1c0926fbb6ea350a61ed7814a761531fbc3df3ec1464cf6574c5fbef7d60e991"));
var deleteAgent = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1aab58855d90df3fb70d76f00b68eb5d12ad4ba43e457e26d64aa3921795a501"));
var saveCustomer = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("50e6be06f0b2831bcd80980c9ca4cb9c248b9b459c77b822b27b452026a40c4b"));
var deleteCustomer = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("8ed78f52680f12f3815a7e3555b4911e9db9b731e0b449666b8cecd3ab2368a0"));
var saveClient = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("72da098738cac099623266b617a02dab7e4fe5b081d3544dc07996d0dbef5e44"));
var deleteClient = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("deee10331dd88a5ff97e91cc139afb0c93aae2ab7f03e8a0f8b5eb0ed4de6adc"));
var saveCall = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("546a5d52727c545a8476cbc19bbd89c2044eaf2a6024fd449aa84b10c3a2f773"));
var deleteCall = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ed7ecdc4db7b1e406d8334cbea057c8b365399b81b235c810f5d6ee07f50b6fc"));
var saveMessage = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1d7a446dada714074d111ee28ddf4825523e5f9533573346914a0ac6858528fe"));
var deleteMessage = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ee0dc78d8172a3fbe5314144768d924fd23b4f0149a04acb25741d08add2763b"));
var mergeCustomers = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b85afd5b59caa1a157b6795673bfc83fa08b301d46b0f8f0a6fdb163d0eb8521"));
var OUTCOMES = [
	"Resolved",
	"Escalated",
	"Follow-up",
	"No Answer",
	"Voicemail",
	"Answered"
];
var CALL_TYPES = [
	"Inbound",
	"Outbound",
	"Callback"
];
var AGENT_ROLES = [
	"Agent",
	"Senior Agent",
	"Team Lead",
	"Supervisor"
];
var AGENT_STATUSES = [
	"Active",
	"Away",
	"Offline",
	"On Break"
];
var CLIENT_STATUSES = [
	"Active",
	"Inactive",
	"Prospect"
];
var MESSAGE_CHANNELS = [
	"SMS",
	"WhatsApp",
	"Email",
	"Chat",
	"Social"
];
var MESSAGE_DIRECTIONS = ["Inbound", "Outbound"];
var MESSAGE_STATUSES = [
	"Open",
	"Pending",
	"Replied",
	"Closed"
];
function formatDate(d) {
	if (!d) return "-";
	const date = new Date(d);
	if (isNaN(date.getTime())) return d;
	return date.toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function formatDuration(mins) {
	if (!mins && mins !== 0) return "-";
	if (mins < 1) return `${Math.round(mins * 60)}s`;
	const m = Math.floor(mins);
	const s = Math.round((mins - m) * 60);
	return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
function todayStr() {
	const d = /* @__PURE__ */ new Date();
	return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function yesterdayStr() {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() - 1);
	return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function agentMap(data) {
	const m = {};
	for (const a of data.agents) m[a.id] = a;
	return m;
}
function customerMap(data) {
	const m = {};
	for (const c of data.customers) m[c.id] = c;
	return m;
}
function clientMap(data) {
	const m = {};
	for (const c of data.clients) m[c.id] = c;
	return m;
}
/** Resolve display company for a customer: linked client name > free-text company */
function customerCompanyLabel(customer, clients) {
	if (!customer) return "-";
	if (customer.clientId && clients[customer.clientId]) return clients[customer.clientId].name;
	return customer.company || "-";
}
/** Digits only from a phone string. */
function phoneDigits(phone) {
	return (phone || "").replace(/\D/g, "");
}
/** Telecom reconcile rows must not move resolution rate. */
function countsForResolution(c) {
	if (c.source === "telecom") return false;
	if (c.outcome === "Answered") return false;
	return true;
}
function resolutionOf(calls) {
	const eligible = calls.filter(countsForResolution);
	const resolved = eligible.filter((c) => c.outcome === "Resolved").length;
	return {
		eligible: eligible.length,
		resolved,
		rate: eligible.length ? resolved / eligible.length : 0,
		percent: eligible.length ? Math.round(resolved / eligible.length * 100) : 0
	};
}
function callRating(c) {
	if (c.rating == null || c.rating === "") return null;
	const n = Number(c.rating);
	if (!Number.isFinite(n) || n <= 0) return null;
	const out = c.ratingScale === 10 || n > 5 ? n : n * 2;
	return Math.round(Math.min(10, out) * 10) / 10;
}
/**
* Match a customer by phone. Prefer exact digit match (min 7 digits).
*/
function findCustomerByPhone(customers, phone) {
	const digits = phoneDigits(phone);
	if (digits.length < 7) return void 0;
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
function getAgentStats(data, agentId) {
	const agentCalls = data.calls.filter((c) => c.agentId === agentId);
	const agentMsgs = (data.messages || []).filter((m) => m.agentId === agentId);
	const today = todayStr();
	const todayCallsList = agentCalls.filter((c) => c.datetime?.startsWith(today));
	const todayMsgsList = agentMsgs.filter((m) => m.datetime?.startsWith(today));
	const total = agentCalls.length;
	const resAll = resolutionOf(agentCalls);
	const resolved = resAll.resolved;
	const ratedScores = agentCalls.map(callRating).filter((n) => n != null);
	const timedAll = agentCalls.filter((c) => (c.duration || 0) > 0);
	const avgDuration = timedAll.length ? timedAll.reduce((s, c) => s + (c.duration || 0), 0) / timedAll.length : 0;
	const csat = ratedScores.length ? ratedScores.reduce((s, n) => s + n, 0) / ratedScores.length : 0;
	const resToday = resolutionOf(todayCallsList);
	resToday.resolved;
	const timedToday = todayCallsList.filter((c) => (c.duration || 0) > 0);
	const todayAvgDuration = timedToday.length ? timedToday.reduce((s, c) => s + (c.duration || 0), 0) / timedToday.length : 0;
	const todayRatedScores = todayCallsList.map(callRating).filter((n) => n != null);
	const todayCsat = todayRatedScores.length ? todayRatedScores.reduce((s, n) => s + n, 0) / todayRatedScores.length : 0;
	const week = rangeQa(agentCalls, startOfWeekStr(0), todayStr());
	const lastWeek = rangeQa(agentCalls, startOfWeekStr(-1), dateOffsetFrom(startOfWeekStr(0), -1));
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
		openFollowUps: agentCalls.filter((c) => c.outcome === "Follow-up" || c.outcome === "Escalated").length + agentMsgs.filter((m) => m.status === "Open" || m.status === "Pending").length,
		weekQa: week.avg,
		weekRated: week.rated,
		lastWeekQa: lastWeek.avg,
		lastWeekRated: lastWeek.rated
	};
}
function getCustomerStats(data, customerId) {
	const custCalls = data.calls.filter((c) => c.customerId === customerId).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	const custMsgs = (data.messages || []).filter((m) => m.customerId === customerId).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	const lastCall = custCalls[0];
	const lastMsg = custMsgs[0];
	let lastContact = lastCall?.datetime;
	if (lastMsg && (!lastContact || lastMsg.datetime > lastContact)) lastContact = lastMsg.datetime;
	return {
		total: custCalls.length,
		messages: custMsgs.length,
		lastCall,
		lastMessage: lastMsg,
		lastContact,
		resolved: custCalls.filter((c) => c.outcome === "Resolved").length,
		escalated: custCalls.filter((c) => c.outcome === "Escalated").length,
		avgDuration: custCalls.length ? custCalls.reduce((s, c) => s + (c.duration || 0), 0) / custCalls.length : 0,
		qaScore: (() => {
			const rated = custCalls.map(callRating).filter((n) => n != null);
			return rated.length ? rated.reduce((s, n) => s + n, 0) / rated.length : 0;
		})(),
		activityNotes: (() => {
			const items = [];
			for (const c of custCalls) if (c.notes?.trim()) items.push({
				t: c.datetime,
				n: c.notes.trim()
			});
			for (const m of custMsgs) if (m.notes?.trim()) items.push({
				t: m.datetime,
				n: m.notes.trim()
			});
			items.sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime());
			return items.map((x) => x.n).join(" | ");
		})(),
		callNotes: custCalls.filter((c) => c.notes).map((c) => c.notes).join(" | ")
	};
}
function getClientStats(data, clientId) {
	const client = data.clients.find((c) => c.id === clientId);
	const clientNameKey = (client?.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
	const contacts = data.customers.filter((c) => {
		if (c.clientId === clientId) return true;
		if (clientNameKey && (c.company || "").toLowerCase().replace(/[^a-z0-9]/g, "") === clientNameKey) return true;
		return false;
	});
	const contactIds = new Set(contacts.map((c) => c.id));
	const calls = data.calls.filter((c) => c.clientId === clientId || contactIds.has(c.customerId)).slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	const messages = (data.messages || []).filter((m) => m.clientId === clientId || contactIds.has(m.customerId)).slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	const resolved = calls.filter((c) => c.outcome === "Resolved").length;
	const escalated = calls.filter((c) => c.outcome === "Escalated").length;
	const followUp = calls.filter((c) => c.outcome === "Follow-up").length;
	const rated = calls.map(callRating).filter((n) => n != null);
	const avgDuration = calls.length ? calls.reduce((s, c) => s + (c.duration || 0), 0) / calls.length : 0;
	const avgQa = rated.length ? rated.reduce((s, n) => s + n, 0) / rated.length : 0;
	const noteItems = [];
	if (client?.notes?.trim()) noteItems.push({
		t: "9999",
		n: client.notes.trim()
	});
	for (const c of calls) if (c.notes?.trim()) noteItems.push({
		t: c.datetime,
		n: c.notes.trim()
	});
	for (const m of messages) if (m.notes?.trim()) noteItems.push({
		t: m.datetime,
		n: m.notes.trim()
	});
	noteItems.sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime());
	let lastActivity;
	if (calls[0]?.datetime) lastActivity = calls[0].datetime;
	if (messages[0]?.datetime && (!lastActivity || messages[0].datetime > lastActivity)) lastActivity = messages[0].datetime;
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
		activityNotes: noteItems.filter((x) => x.t !== "9999").map((x) => x.n).join(" | "),
		allNotes: noteItems.map((x) => x.n).join(" | ")
	};
}
/** Calls/messages within the last `days` days (for bi-weekly client reports). */
function filterSinceDatetime(items, days) {
	const cut = Date.now() - days * 24 * 60 * 60 * 1e3;
	return items.filter((item) => {
		const t = new Date(item.datetime).getTime();
		return !Number.isNaN(t) && t >= cut;
	});
}
function downloadText(content, filename, mime) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function escapeCsv(val) {
	const s = val == null ? "" : String(val);
	if (/[",\n]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
function localDatetimeValue(d = /* @__PURE__ */ new Date()) {
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/** Truncate long notes for table cells */
function shortNotes(text, max = 60) {
	const t = (text || "").trim();
	if (!t) return "-";
	return t.length > max ? t.slice(0, max - 1) + "…" : t;
}
function ymd(d) {
	return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dateOffsetStr(days) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + days);
	return ymd(d);
}
function dateOffsetFrom(dateStr, days) {
	const d = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
	d.setDate(d.getDate() + days);
	return ymd(d);
}
/** Monday of the week, offsetWeeks=0 this week, -1 last week. */
function startOfWeekStr(offsetWeeks = 0) {
	const d = /* @__PURE__ */ new Date();
	const day = d.getDay();
	const mondayOffset = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + mondayOffset + offsetWeeks * 7);
	return ymd(d);
}
function rangeQa(calls, from, to) {
	const list = calls.filter((c) => {
		const d = (c.datetime || "").slice(0, 10);
		return d >= from && d <= to;
	});
	const scores = list.map(callRating).filter((n) => n != null);
	return {
		count: list.length,
		rated: scores.length,
		avg: scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0
	};
}
function periodQa(calls, days) {
	const list = filterSinceDatetime(calls, days);
	const scores = list.map(callRating).filter((n) => n != null);
	return {
		count: list.length,
		rated: scores.length,
		avg: scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0
	};
}
function getFollowUpItems(data) {
	const today = todayStr();
	const items = [];
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
			notes: c.notes || ""
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
			notes: m.notes || m.body || ""
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
function getUnratedRecent(data, days = 14) {
	return filterSinceDatetime(data.calls, days).filter((c) => callRating(c) == null).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}
function groupUnratedCalls(calls) {
	const map = /* @__PURE__ */ new Map();
	for (const c of calls) {
		const key = c.customerId || c.id;
		const g = map.get(key);
		if (g) g.calls.push(c);
		else map.set(key, {
			key,
			customerId: c.customerId,
			calls: [c]
		});
	}
	return Array.from(map.values());
}
function customerTimeline(data, customerId) {
	const items = [];
	for (const c of data.calls.filter((x) => x.customerId === customerId)) items.push({
		id: c.id,
		kind: "call",
		datetime: c.datetime,
		title: `${c.type} · ${c.outcome}`,
		detail: formatDuration(c.duration),
		notes: c.notes || "",
		rating: callRating(c)
	});
	for (const m of (data.messages || []).filter((x) => x.customerId === customerId)) items.push({
		id: m.id,
		kind: "message",
		datetime: m.datetime,
		title: `${m.channel} · ${m.direction} · ${m.status}`,
		detail: m.subject || "",
		notes: (m.notes || m.body || "").trim(),
		rating: null
	});
	items.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	return items;
}
function customersSharingPhone(customers, phone, exceptId) {
	const digits = phoneDigits(phone);
	if (digits.length < 7) return [];
	return customers.filter((c) => {
		if (exceptId && c.id === exceptId) return false;
		return phoneDigits(c.phone) === digits;
	});
}
var PURPLE = {
	r: 167,
	g: 67,
	b: 255
};
var INK = {
	r: 45,
	g: 27,
	b: 78
};
var MUTED = {
	r: 110,
	g: 90,
	b: 140
};
var LINE = {
	r: 228,
	g: 214,
	b: 245
};
var WASH = {
	r: 248,
	g: 244,
	b: 252
};
var WHITE = {
	r: 255,
	g: 255,
	b: 255
};
var logoCache = null;
async function loadLogo() {
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
function periodLabel() {
	const end = /* @__PURE__ */ new Date();
	const start = /* @__PURE__ */ new Date();
	start.setDate(end.getDate() - 13);
	const fmt = (d) => d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
	return {
		start: fmt(start),
		end: fmt(end),
		pretty: `${fmt(start)} to ${fmt(end)}`
	};
}
function safeFile(name) {
	return name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40);
}
async function downloadClientPdf(opts) {
	const { client, contacts, calls, messages, agentsById, customersById } = opts;
	const logo = await loadLogo();
	const period = periodLabel();
	const qa = periodQa(calls, 4e3);
	const inbound = calls.filter((c) => (c.type || "Inbound") === "Inbound").length;
	const outbound = calls.filter((c) => c.type === "Outbound").length;
	const res = resolutionOf(calls);
	const resolved = res.resolved;
	const escalated = calls.filter((c) => c.outcome === "Escalated").length;
	const follow = calls.filter((c) => c.outcome === "Follow-up").length;
	const openFollow = getFollowUpItems({
		agents: [],
		customers: contacts,
		clients: [client],
		calls,
		messages
	}).length;
	const aht = calls.length ? calls.reduce((s, c) => s + (c.duration || 0), 0) / calls.length : 0;
	const resolution = res.percent;
	const generated = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
	const docId = `ZYN-${todayStr().replace(/-/g, "")}-${client.id.slice(-6).toUpperCase()}`;
	const doc = new import_jspdf_node_min.jsPDF({
		unit: "mm",
		format: "a4",
		orientation: "portrait"
	});
	const pageW = doc.internal.pageSize.getWidth();
	const pageH = doc.internal.pageSize.getHeight();
	const margin = 16;
	const drawHeader = (page) => {
		doc.setFillColor(INK.r, INK.g, INK.b);
		doc.rect(0, 0, pageW, 22, "F");
		doc.setFillColor(PURPLE.r, PURPLE.g, PURPLE.b);
		doc.rect(0, 22, pageW, 1.2, "F");
		if (logo) try {
			doc.addImage(logo, "PNG", margin, 5.2, 38, 11);
		} catch {
			doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(14);
			doc.text("ZYNLO", margin, 14);
		}
		else {
			doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(14);
			doc.text("ZYNLO", margin, 14);
		}
		doc.setTextColor(255, 230, 255);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8);
		doc.text("CONTACT CENTRE  ·  CONFIDENTIAL", pageW - margin, 13.5, { align: "right" });
		doc.setFillColor(WASH.r, WASH.g, WASH.b);
		doc.rect(0, pageH - 12, pageW, 12, "F");
		doc.setDrawColor(LINE.r, LINE.g, LINE.b);
		doc.setLineWidth(.2);
		doc.line(0, pageH - 12, pageW, pageH - 12);
		doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.text(`Document ${docId}`, margin, pageH - 5);
		doc.text("Zynlo  ·  Client confidential", pageW / 2, pageH - 5, { align: "center" });
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
	doc.setFillColor(WASH.r, WASH.g, WASH.b);
	doc.roundedRect(margin, y, pageW - margin * 2, 14, 1.5, 1.5, "F");
	doc.setFont("helvetica", "bold");
	doc.setFontSize(7.5);
	doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
	const metas = [
		["Classification", "Confidential"],
		["Status", client.status || "Active"],
		["Industry", client.industry || "Not specified"],
		["Contacts", String(contacts.length)]
	];
	const slot = (pageW - margin * 2) / metas.length;
	metas.forEach(([k, v], i) => {
		const x = 20 + i * slot;
		doc.setFont("helvetica", "normal");
		doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
		doc.text(k.toUpperCase(), x, y + 5.5);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(INK.r, INK.g, INK.b);
		doc.text(v, x, y + 10.5);
	});
	y += 22;
	const kpis = [
		["Calls", String(calls.length)],
		["Messages", String(messages.length)],
		["Resolved", `${resolution}%`],
		["Avg handle", formatDuration(aht)],
		["QA score", qa.rated ? `${qa.avg.toFixed(1)} / 10` : "-"],
		["Open follow-ups", String(openFollow)]
	];
	const gap = 3;
	const tileW = (pageW - margin * 2 - gap * 2) / 3;
	const tileH = 18;
	kpis.forEach(([label, value], i) => {
		const col = i % 3;
		const row = Math.floor(i / 3);
		const x = margin + col * (tileW + gap);
		const ty = y + row * 21;
		doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
		doc.setDrawColor(LINE.r, LINE.g, LINE.b);
		doc.setLineWidth(.3);
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
	y += 47;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(11);
	doc.setTextColor(INK.r, INK.g, INK.b);
	doc.text("Executive summary", margin, y);
	y += 6;
	const narrative = [
		`Zynlo handled ${calls.length} call${calls.length === 1 ? "" : "s"} and ${messages.length} message${messages.length === 1 ? "" : "s"} for ${client.name} in this 14-day period.`,
		`Direction mix: ${inbound} inbound, ${outbound} outbound. Outcomes: ${resolved} resolved, ${escalated} escalated, ${follow} follow-up.`,
		qa.rated ? `Quality assurance averaged ${qa.avg.toFixed(1)} from ${qa.rated} scored call${qa.rated === 1 ? "" : "s"} in the period.` : "No scored quality reviews were recorded in this period.",
		openFollow ? `${openFollow} item${openFollow === 1 ? " remains" : "s remain"} open for follow-up.` : "No open follow-up items at the time of this report."
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
		fillColor: [
			INK.r,
			INK.g,
			INK.b
		],
		textColor: 255,
		fontStyle: "bold",
		fontSize: 7.5,
		cellPadding: 2.2
	};
	const tableBody = {
		textColor: [
			INK.r,
			INK.g,
			INK.b
		],
		fontSize: 7.5,
		cellPadding: 2
	};
	const alt = { fillColor: [
		WASH.r,
		WASH.g,
		WASH.b
	] };
	const afterTable = (hook) => {
		drawHeader(hook.pageNumber);
	};
	doc.setFont("helvetica", "bold");
	doc.setFontSize(11);
	doc.setTextColor(INK.r, INK.g, INK.b);
	doc.text("Customer directory", margin, y);
	y += 3;
	autoTable(doc, {
		startY: y,
		margin: {
			top: 28,
			left: margin,
			right: margin,
			bottom: 16
		},
		head: [[
			"Name",
			"Phone",
			"Email",
			"Calls",
			"Messages"
		]],
		body: contacts.length ? contacts.map((cu) => [
			cu.name || "Unknown",
			cu.phone || "-",
			cu.email || "-",
			String(calls.filter((c) => c.customerId === cu.id).length),
			String(messages.filter((m) => m.customerId === cu.id).length)
		]) : [[
			"No customers in this period",
			"",
			"",
			"",
			""
		]],
		theme: "plain",
		styles: {
			font: "helvetica",
			overflow: "linebreak",
			valign: "middle"
		},
		headStyles: tableHead,
		bodyStyles: tableBody,
		alternateRowStyles: alt,
		didDrawPage: afterTable
	});
	let y2 = doc.lastAutoTable.finalY + 10;
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
		margin: {
			top: 28,
			left: margin,
			right: margin,
			bottom: 16
		},
		head: [[
			"When",
			"Customer",
			"Phone",
			"Type",
			"Agent",
			"Duration",
			"Outcome",
			"QA",
			"Notes"
		]],
		body: calls.length ? calls.map((c) => {
			const cu = customersById[c.customerId];
			return [
				formatDate(c.datetime),
				cu?.name || "Unknown",
				cu?.phone || "-",
				c.type || "Inbound",
				agentsById[c.agentId]?.name || "-",
				formatDuration(c.duration),
				c.outcome,
				callRating(c) != null ? String(callRating(c)) : "-",
				(c.notes || "").slice(0, 90)
			];
		}) : [[
			"No calls in this period",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			""
		]],
		theme: "plain",
		styles: {
			font: "helvetica",
			overflow: "linebreak",
			valign: "middle"
		},
		headStyles: tableHead,
		bodyStyles: tableBody,
		alternateRowStyles: alt,
		columnStyles: {
			0: { cellWidth: 28 },
			2: { cellWidth: 24 },
			5: { cellWidth: 16 },
			7: { cellWidth: 10 },
			8: { cellWidth: 32 }
		},
		didDrawPage: afterTable
	});
	let y3 = doc.lastAutoTable.finalY + 10;
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
		margin: {
			top: 28,
			left: margin,
			right: margin,
			bottom: 16
		},
		head: [[
			"When",
			"Customer",
			"Phone",
			"Channel",
			"Dir",
			"Agent",
			"Status",
			"Detail"
		]],
		body: messages.length ? messages.map((m) => {
			const cu = customersById[m.customerId];
			return [
				formatDate(m.datetime),
				cu?.name || "Unknown",
				cu?.phone || "-",
				m.channel,
				m.direction,
				agentsById[m.agentId]?.name || "-",
				m.status,
				(m.notes || m.body || "").slice(0, 80)
			];
		}) : [[
			"No messages in this period",
			"",
			"",
			"",
			"",
			"",
			"",
			""
		]],
		theme: "plain",
		styles: {
			font: "helvetica",
			overflow: "linebreak",
			valign: "middle"
		},
		headStyles: tableHead,
		bodyStyles: tableBody,
		alternateRowStyles: alt,
		didDrawPage: afterTable
	});
	const pages = doc.getNumberOfPages();
	for (let i = 1; i <= pages; i++) {
		doc.setPage(i);
		drawHeader(i);
	}
	doc.save(`Zynlo_${safeFile(client.name)}_Report_${todayStr()}.pdf`);
}
var MATCH_MS = 600 * 1e3;
function hhmmssToMinutes(raw) {
	const m = raw.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
	if (!m) return 0;
	const sec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
	return Math.round(sec / 60 * 10) / 10;
}
function toIsoLocal(dt) {
	return dt.trim().replace(" ", "T");
}
function extractPhone(block) {
	const angled = block.match(/<0\d{8,11}>/);
	if (angled) return angled[0].replace(/\D/g, "");
	const nums = block.replace(/[^\d]/g, " ").match(/\d{9,12}/g) || [];
	const mobile = nums.find((n) => n.startsWith("07") || n.startsWith("7") && n.length === 9);
	if (mobile) return mobile.startsWith("0") ? mobile : `0${mobile}`;
	const local = nums.find((n) => n.startsWith("0") && !n.startsWith("011"));
	if (local) return local;
	const nine = nums.find((n) => n.length === 9 && n[0] === "7");
	if (nine) return `0${nine}`;
	return nums.find((n) => n.length >= 9) || "";
}
function typeFromLabel(raw) {
	const k = (raw || "").toLowerCase();
	if (!k || k.includes("internal")) return null;
	if (/outgoing|outbound|out going|out-going/.test(k)) return "Outbound";
	if (/incoming|inbound|in coming|in-coming/.test(k)) return "Inbound";
	return null;
}
/** Filename and report title only. Never scan data rows. */
function detectCallDirection(name, text = "") {
	const lines = text.split(/\r?\n/).slice(0, 10);
	const preamble = [];
	for (const line of lines) {
		const low = line.toLowerCase();
		if (/(^|,)date(,|$)/.test(low.replace(/\s+/g, "")) || low.includes("disposition") && low.includes("date")) break;
		preamble.push(line);
	}
	const blob = `${name}\n${preamble.join("\n")}`.toLowerCase();
	if (/\boutgoing\b|\boutbound\b|\bout going\b|\bout-going\b|\bdialled\b|\bdialed\b/.test(blob)) return "Outbound";
	if (/\bincoming\b|\binbound\b|\bin coming\b|\bin-coming\b/.test(blob)) return "Inbound";
	return null;
}
function extractGeneratedBy(text) {
	const email = text.match(/generated\s*by[:\s]+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
	if (email) return email[1].trim();
	const name = text.match(/generated\s*by[:\s]+([A-Za-z][A-Za-z .'-]{1,40})/);
	return name ? name[1].trim() : "";
}
var FILENAME_NOISE = /* @__PURE__ */ new Set([
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
	"on"
]);
function detectAgentFromFilename(filename, agents) {
	if (!filename || agents.length === 0) return "";
	const tokens = filename.replace(/\.[^.]+$/, "").toLowerCase().replace(/[()[\]{}]/g, " ").replace(/[_.,-]+/g, " ").split(/\s+/).filter((t) => t && !FILENAME_NOISE.has(t) && !/^\d+$/.test(t) && t.length > 2);
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
		const local = (a.email || "").split("@")[0].toLowerCase().replace(/[._-]+/g, " ").trim();
		return local.length > 2 && (blob.includes(local) || tokens.includes(local));
	});
	if (byEmail) return byEmail.id;
	const scored = agents.map((a) => {
		const hit = a.name.toLowerCase().split(/\s+/).filter((p) => p.length > 2).filter((p) => tokens.includes(p) || blob.includes(p)).sort((x, y) => y.length - x.length)[0];
		return {
			a,
			len: hit ? hit.length : 0
		};
	}).filter((x) => x.len >= 3).sort((a, b) => b.len - a.len);
	if (scored.length === 0) return "";
	if (scored.length === 1 || scored[0].len > scored[1].len) return scored[0].a.id;
	return "";
}
function matchAgentId(hint, agents) {
	const raw = (hint || "").trim();
	if (!raw || agents.length === 0) return "";
	const h = raw.toLowerCase();
	const byEmail = agents.find((a) => (a.email || "").toLowerCase() === h);
	if (byEmail) return byEmail.id;
	const local = h.split("@")[0].replace(/[._]+/g, " ").trim();
	const byExact = agents.find((a) => a.name.toLowerCase() === h || a.name.toLowerCase() === local);
	if (byExact) return byExact.id;
	const tokens = local.split(/\s+/).filter((t) => t.length > 2);
	const scored = agents.map((a) => {
		const n = a.name.toLowerCase();
		return {
			a,
			hit: tokens.some((t) => n.includes(t))
		};
	}).filter((x) => x.hit);
	if (scored.length === 1) return scored[0].a.id;
	return "";
}
function parseTelecomText(text, fileDirection) {
	const generatedBy = extractGeneratedBy(text);
	const chunks = text.split(/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
	const rows = [];
	for (const chunk of chunks) {
		const dtMatch = chunk.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
		if (!dtMatch) continue;
		const dispMatch = chunk.match(/\b(ANSWERED|NO ANSWER|FAILED|BUSY)\b/i);
		if (!dispMatch) continue;
		const typeMatch = chunk.match(/\b(Incoming|Outgoing|Internal)\b/i);
		if (!typeMatch) continue;
		const kind = typeMatch[1].toLowerCase();
		if (kind === "internal") continue;
		const durationRaw = (chunk.match(/\b\d{2}:\d{2}:\d{2}\b/g) || [])[1] || "00:00:00";
		const phone = extractPhone(chunk.slice(0, dispMatch.index || 0));
		if (phone.length < 7) continue;
		const type = fileDirection || (kind === "outgoing" ? "Outbound" : "Inbound");
		rows.push({
			datetime: toIsoLocal(dtMatch[1]),
			phone,
			did: (chunk.match(/\b011\d{7}\b/) || [""])[0],
			type,
			durationMin: hhmmssToMinutes(durationRaw),
			durationRaw,
			disposition: dispMatch[1].toUpperCase(),
			agentHint: generatedBy
		});
	}
	return rows;
}
function parseCsvRows(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let quoted = false;
	const src = text.replace(/^\uFEFF/, "");
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (quoted) if (ch === "\"") if (src[i + 1] === "\"") {
			cell += "\"";
			i++;
		} else quoted = false;
		else cell += ch;
		else if (ch === "\"") quoted = true;
		else if (ch === "," || ch === ";") {
			row.push(cell.trim());
			cell = "";
		} else if (ch === "\n") {
			row.push(cell.trim());
			if (row.some((c) => c)) rows.push(row);
			row = [];
			cell = "";
		} else if (ch !== "\r") cell += ch;
	}
	if (cell || row.length) {
		row.push(cell.trim());
		if (row.some((c) => c)) rows.push(row);
	}
	return rows;
}
function normHeader(h) {
	return h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function headerIndex(headers, aliases) {
	for (const alias of aliases) {
		const exact = headers.findIndex((h) => h === alias);
		if (exact >= 0) return exact;
	}
	for (const alias of aliases) {
		const i = headers.findIndex((h) => {
			if (!(h.includes(alias) || alias.includes(h))) return false;
			if (alias === "time" && (h.includes("wait") || h.includes("talk"))) return false;
			if (alias === "date" && h.includes("update")) return false;
			if (alias === "type" && h.includes("wait")) return false;
			return h === alias || h.startsWith(alias) || h.endsWith(alias);
		});
		if (i >= 0) return i;
	}
	return -1;
}
function findHeaderRow(table) {
	const max = Math.min(table.length, 20);
	for (let i = 0; i < max; i++) {
		const headers = table[i].map(normHeader);
		const hasDate = headerIndex(headers, [
			"date",
			"datetime",
			"start time"
		]) >= 0;
		const hasDisp = headerIndex(headers, [
			"disposition",
			"call status",
			"result"
		]) >= 0;
		const hasType = headerIndex(headers, ["call type", "direction"]) >= 0;
		if (hasDate && (hasDisp || hasType)) return i;
	}
	return 0;
}
function parseDurationCell(raw) {
	const t = raw.trim();
	const hms = t.match(/(\d{1,2}):(\d{2}):(\d{2})/);
	if (hms) {
		const clock = `${hms[1]}:${hms[2]}:${hms[3]}`;
		return {
			min: hhmmssToMinutes(clock),
			raw: clock
		};
	}
	const hm = t.match(/^(\d{1,2}):(\d{2})$/);
	if (hm) {
		const clock = `${hm[1]}:${hm[2]}:00`;
		return {
			min: hhmmssToMinutes(clock),
			raw: clock
		};
	}
	const n = Number(t);
	if (Number.isFinite(n) && n > 0 && n < 1) return {
		min: Math.round(n * 24 * 60 * 10) / 10,
		raw: t
	};
	if (Number.isFinite(n) && n >= 0) return {
		min: Math.round(n * 10) / 10,
		raw: t
	};
	return {
		min: 0,
		raw: t
	};
}
function parseDateCell(raw) {
	const t = raw.trim().replace(/^2\.(\d{3}-)/, "2$1");
	const iso = t.match(/(\d{4})[.\/-](\d{2})[.\/-](\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
	if (iso) {
		const hh = iso[4].padStart(2, "0");
		const ss = (iso[6] || "00").padStart(2, "0");
		return `${iso[1]}-${iso[2]}-${iso[3]}T${hh}:${iso[5]}:${ss}`;
	}
	const dmy = t.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
	if (dmy) {
		const dd = dmy[1].padStart(2, "0");
		const mm = dmy[2].padStart(2, "0");
		const ss = (dmy[6] || "00").padStart(2, "0");
		const hh = dmy[4].padStart(2, "0");
		return `${dmy[3]}-${mm}-${dd}T${hh}:${dmy[5]}:${ss}`;
	}
	return "";
}
function parseTelecomCsv(text, fileDirection) {
	const generatedBy = extractGeneratedBy(text);
	const table = parseCsvRows(text);
	if (table.length < 2) return [];
	const headerAt = findHeaderRow(table);
	const headers = table[headerAt].map(normHeader);
	const iDate = headerIndex(headers, [
		"date",
		"datetime",
		"start time"
	]);
	const iCaller = headerIndex(headers, [
		"caller",
		"phone",
		"ani",
		"clid"
	]);
	const iDest = headerIndex(headers, [
		"destination",
		"dst",
		"called",
		"called number",
		"to number",
		"callee",
		"dialed"
	]);
	const iDid = headerIndex(headers, ["did"]);
	const iDisp = headerIndex(headers, [
		"disposition",
		"call status",
		"result"
	]);
	const iType = headerIndex(headers, [
		"call type",
		"direction",
		"type"
	]);
	const iDur = headerIndex(headers, [
		"duration",
		"talk time",
		"billsec"
	]);
	const iAgent = headerIndex(headers, [
		"agent",
		"operator",
		"user",
		"staff",
		"extension name"
	]);
	if (iDate < 0 && iDisp < 0) return [];
	const rows = [];
	for (const cells of table.slice(headerAt + 1)) {
		const joined = cells.join(" ");
		const disp = ((iDisp >= 0 ? cells[iDisp] : "") || (joined.match(/\b(ANSWERED|NO ANSWER|FAILED|BUSY)\b/i) || [""])[0]).toUpperCase();
		const typeRaw = (iType >= 0 ? cells[iType] : "") || "";
		if (typeRaw.toLowerCase().includes("internal")) continue;
		const datetime = parseDateCell((iDate >= 0 ? cells[iDate] : "") || joined);
		const cellType = typeFromLabel(typeRaw);
		const type = fileDirection || cellType || "Inbound";
		const phone = extractPhone((type === "Outbound" ? [iDest >= 0 ? cells[iDest] : "", iCaller >= 0 ? cells[iCaller] : ""].join(" ") : [iCaller >= 0 ? cells[iCaller] : "", iDest >= 0 ? cells[iDest] : ""].join(" ")) || joined);
		if (!datetime || phone.length < 7) continue;
		let dur = parseDurationCell(iDur >= 0 ? cells[iDur] || "" : "");
		if (dur.min === 0) {
			const clocks = joined.match(/\d{1,2}:\d{2}:\d{2}/g) || [];
			const dateRaw = iDate >= 0 ? cells[iDate] || "" : "";
			const extra = clocks.find((c) => !dateRaw.includes(c));
			if (extra) dur = parseDurationCell(extra);
		}
		const agentHint = (iAgent >= 0 ? cells[iAgent] : "") || generatedBy;
		rows.push({
			datetime,
			phone,
			did: iDid >= 0 ? extractPhone(cells[iDid] || "") : "",
			type,
			durationMin: dur.min,
			durationRaw: dur.raw,
			disposition: disp.includes("ANSWER") && !disp.includes("NO") ? "ANSWERED" : disp.includes("NO ANSWER") ? "NO ANSWER" : disp.includes("BUSY") ? "BUSY" : disp.includes("FAIL") ? "FAILED" : disp,
			agentHint: agentHint.trim()
		});
	}
	return rows;
}
function answeredCustomerRows(rows) {
	const answered = rows.filter((r) => r.disposition === "ANSWERED").sort((a, b) => a.datetime.localeCompare(b.datetime));
	const kept = [];
	for (const row of answered) {
		const t = callTime(row.datetime);
		const hit = kept.findIndex((k) => k.type === row.type && samePhone(k.phone, row.phone) && Math.abs(callTime(k.datetime) - t) <= MATCH_MS);
		if (hit < 0) {
			kept.push(row);
			continue;
		}
		if (row.durationMin > kept[hit].durationMin) kept[hit] = row;
	}
	return kept;
}
function samePhone(a, b) {
	const da = phoneDigits(a);
	const db = phoneDigits(b);
	if (da.length < 7 || db.length < 7) return false;
	if (da === db) return true;
	const longer = da.length >= db.length ? da : db;
	const shorter = da.length >= db.length ? db : da;
	return longer.endsWith(shorter) && longer.length - shorter.length <= 3;
}
function callTime(value) {
	const t = new Date(value.includes("T") ? value : value.replace(" ", "T")).getTime();
	return Number.isFinite(t) ? t : 0;
}
function closestCall(row, data, sameTypeOnly) {
	const target = callTime(row.datetime);
	if (!target) return void 0;
	const customersById = {};
	for (const c of data.customers) customersById[c.id] = c;
	let best;
	let bestDelta = 600001;
	for (const call of data.calls) {
		const cu = customersById[call.customerId];
		if (!cu || !samePhone(cu.phone, row.phone)) continue;
		const ct = callTime(call.datetime);
		if (!ct) continue;
		const delta = Math.abs(ct - target);
		if (delta > MATCH_MS) continue;
		const callType = call.type || "Inbound";
		if (sameTypeOnly && callType !== row.type) continue;
		if (!sameTypeOnly && callType === row.type) continue;
		if (delta < bestDelta) {
			best = call;
			bestDelta = delta;
		}
	}
	return best;
}
function buildReconcilePreviewFromRows(filename, all, data, agents = [], fileDirection = null) {
	const answered = answeredCustomerRows(all);
	const already = [];
	const missing = [];
	const directionFixes = [];
	const seen = /* @__PURE__ */ new Set();
	const bothDirections = answered.some((r) => r.type === "Inbound") && answered.some((r) => r.type === "Outbound");
	const phonesWithBoth = /* @__PURE__ */ new Set();
	if (bothDirections) {
		const types = /* @__PURE__ */ new Map();
		for (const row of answered) {
			const key = phoneDigits(row.phone);
			const set = types.get(key) || /* @__PURE__ */ new Set();
			set.add(row.type);
			types.set(key, set);
		}
		for (const [phone, set] of types) if (set.has("Inbound") && set.has("Outbound")) phonesWithBoth.add(phone);
	}
	for (const row of answered) {
		const same = closestCall(row, data, true);
		if (same) {
			if (seen.has(same.id)) continue;
			seen.add(same.id);
			const fromDuration = Number(same.duration) || 0;
			const toDuration = row.durationMin || 0;
			if (toDuration > 0 && Math.abs(toDuration - fromDuration) >= .05) directionFixes.push({
				callId: same.id,
				phone: row.phone,
				datetime: row.datetime,
				from: same.type || "Inbound",
				to: same.type || "Inbound",
				fromDuration,
				toDuration
			});
			else already.push(row);
			continue;
		}
		if (!(bothDirections || phonesWithBoth.has(phoneDigits(row.phone)))) {
			const other = closestCall(row, data, false);
			if (other && !seen.has(other.id) && (other.type || "Inbound") !== row.type) {
				seen.add(other.id);
				const fromDuration = Number(other.duration) || 0;
				const toDuration = row.durationMin || 0;
				directionFixes.push({
					callId: other.id,
					phone: row.phone,
					datetime: row.datetime,
					from: other.type || "Inbound",
					to: row.type,
					fromDuration,
					toDuration: toDuration > 0 ? toDuration : fromDuration
				});
				continue;
			}
		}
		missing.push(row);
	}
	const fromFile = detectAgentFromFilename(filename, agents);
	const hint = answered.find((r) => r.agentHint)?.agentHint || all.find((r) => r.agentHint)?.agentHint || "";
	const detectedAgentId = fromFile || matchAgentId(hint, agents);
	const detectedAgentName = agents.find((a) => a.id === detectedAgentId)?.name || hint;
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
		detectedAgentId,
		detectedAgentName,
		detectedDirection: fileDirection
	};
}
async function extractPdfText(file) {
	if (typeof window === "undefined") throw new Error("PDF reading is only available in the browser");
	const pdfjs = await import("../_libs/pdfjs-dist.mjs").then((n) => n.t);
	const workerMod = await import("./pdf.worker.min-C4v1Kq3M.mjs");
	const workerSrc = typeof workerMod.default === "string" ? workerMod.default : String(workerMod.default || "");
	pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
	const data = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array(file);
	const pdf = await pdfjs.getDocument({ data }).promise;
	const pages = [];
	for (let i = 1; i <= pdf.numPages; i++) {
		const content = await (await pdf.getPage(i)).getTextContent();
		const line = [];
		for (const item of content.items) if ("str" in item && item.str) line.push(item.str);
		pages.push(line.join("\n"));
	}
	return pages.join("\n");
}
async function parseTelecomFile(file) {
	if (file.name.toLowerCase().endsWith(".csv") || file.type.includes("csv") || file.type.includes("excel")) {
		const text = await file.text();
		const fileDirection = detectCallDirection(file.name, text);
		return {
			rows: parseTelecomCsv(text, fileDirection),
			generatedBy: extractGeneratedBy(text),
			fileDirection
		};
	}
	const text = await extractPdfText(file);
	const fileDirection = detectCallDirection(file.name, text);
	return {
		rows: parseTelecomText(text, fileDirection),
		generatedBy: extractGeneratedBy(text),
		fileDirection
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Badge({ children, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", {
			default: "bg-purple-100 text-purple-700",
			strong: "bg-primary text-white",
			soft: "bg-purple-50 text-purple-600",
			outline: "bg-white text-purple-700 border border-border"
		}[tone]),
		children
	});
}
function Avatar({ name }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-xs font-bold text-white shadow-[0_2px_8px_rgba(167,67,255,0.25)]",
		children: name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
	});
}
function Btn({ children, variant = "primary", size = "md", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50", {
			primary: "bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.25)] hover:bg-primary-dark",
			secondary: "bg-white border border-border text-fg hover:border-primary hover:text-primary",
			ghost: "bg-transparent text-muted hover:bg-purple-50 hover:text-primary",
			danger: "bg-white border border-purple-300 text-purple-700 hover:bg-purple-50"
		}[variant], {
			sm: "px-3 py-1.5 text-xs",
			md: "px-4 py-2.5 text-sm",
			icon: "h-8 w-8 p-0"
		}[size], className),
		...props,
		children
	});
}
function Card({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_8px_rgba(167,67,255,0.06)]", className),
		children
	});
}
function CardHeader({ title, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-base font-bold text-fg",
			children: title
		}), action]
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("flex flex-col gap-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold uppercase tracking-wide text-muted",
			children: label
		}), children]
	});
}
var inputClass = "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)]";
function Modal({ open, onClose, title, children, footer, wide }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(26,11,46,0.6)] p-4 backdrop-blur-sm",
		onClick: (e) => {
			if (e.target === e.currentTarget) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("max-h-[90vh] w-full overflow-y-auto rounded-[20px] bg-white shadow-[0_25px_80px_rgba(26,11,46,0.3)]", wide ? "max-w-2xl" : "max-w-lg"),
			role: "dialog",
			"aria-modal": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-6 pt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-fg",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "flex h-9 w-9 items-center justify-center rounded-[10px] text-muted hover:bg-bg hover:text-primary",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-6 py-5",
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4",
					children: footer
				})
			]
		})
	});
}
function EmptyState({ icon, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-16 text-center text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex justify-center opacity-40",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-bold text-fg",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm",
				children: description
			})
		]
	});
}
function Stars({ rating }) {
	if (rating == null || Number(rating) <= 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted",
		children: "-"
	});
	const n = Number(rating);
	const label = n % 1 ? n.toFixed(1) : String(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "font-semibold text-primary",
		"aria-label": `${label} of 10`,
		children: [label, "/10"]
	});
}
function ToastStack({ toasts, onDismiss }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed bottom-5 right-5 z-[1001] flex max-w-[calc(100vw-2rem)] flex-col gap-2 sm:top-5 sm:bottom-auto",
		children: toasts.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-auto animate-slide-in flex min-w-[260px] max-w-sm items-center gap-2 rounded-xl border border-border border-l-4 border-l-primary bg-white px-4 py-3 text-sm font-medium shadow-lg",
			onClick: () => onDismiss(t.id),
			children: t.message
		}, t.id))
	});
}
var LAST_AGENT_KEY = "zynlo.lastAgentId";
function readLastAgentId() {
	try {
		return localStorage.getItem(LAST_AGENT_KEY) || "";
	} catch {
		return "";
	}
}
function writeLastAgentId(id) {
	try {
		if (id) localStorage.setItem(LAST_AGENT_KEY, id);
	} catch {}
}
function contactBits(cu) {
	const name = (cu?.name || "").trim() || "Unknown";
	const phone = (cu?.phone || "").trim();
	return {
		name,
		phone,
		line: phone ? `${name} · ${phone}` : name
	};
}
var NAV = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		id: "calls",
		label: "Call Log",
		icon: ClipboardList
	},
	{
		id: "messages",
		label: "Messages",
		icon: MessageSquare
	},
	{
		id: "agents",
		label: "Agents",
		icon: Users
	},
	{
		id: "customers",
		label: "Customers",
		icon: UserRound
	},
	{
		id: "clients",
		label: "Clients",
		icon: Building2
	},
	{
		id: "analytics",
		label: "Analytics",
		icon: TrendingUp
	}
];
var CHART_COLORS = [
	"#a743ff",
	"#c77dff",
	"#8a2be2",
	"#6b21a8",
	"#d4b8f5",
	"#2d1b4e"
];
var outcomeTone = (o) => {
	if (o === "Resolved") return "strong";
	if (o === "Escalated") return "outline";
	if (o === "Follow-up") return "soft";
	if (o === "Answered") return "soft";
	return "default";
};
var msgStatusTone = (s) => {
	if (s === "Closed" || s === "Replied") return "strong";
	if (s === "Pending") return "soft";
	return "default";
};
function ZynloApp({ initial }) {
	const [data, setData] = (0, import_react.useState)({
		...initial,
		messages: initial.messages || []
	});
	const [section, setSection] = (0, import_react.useState)("dashboard");
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const [modal, setModal] = (0, import_react.useState)(null);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [toasts, setToasts] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [boot, setBoot] = (0, import_react.useState)(true);
	const [callSearch, setCallSearch] = (0, import_react.useState)("");
	const [callOutcome, setCallOutcome] = (0, import_react.useState)("");
	const [callAgent, setCallAgent] = (0, import_react.useState)("");
	const [callType, setCallType] = (0, import_react.useState)("");
	const [msgSearch, setMsgSearch] = (0, import_react.useState)("");
	const [msgChannel, setMsgChannel] = (0, import_react.useState)("");
	const [msgStatus, setMsgStatus] = (0, import_react.useState)("");
	const [customerSearch, setCustomerSearch] = (0, import_react.useState)("");
	const [clientSearch, setClientSearch] = (0, import_react.useState)("");
	const [analyticsTab, setAnalyticsTab] = (0, import_react.useState)("performance");
	const [exportClientStep, setExportClientStep] = (0, import_react.useState)(false);
	const [exportClientName, setExportClientName] = (0, import_react.useState)("");
	const [selectedClientId, setSelectedClientId] = (0, import_react.useState)(null);
	const [selectedCustomerId, setSelectedCustomerId] = (0, import_react.useState)(null);
	const [meAgentId, setMeAgentId] = (0, import_react.useState)("");
	const [queueScope, setQueueScope] = (0, import_react.useState)("mine");
	const [nameOverwrite, setNameOverwrite] = (0, import_react.useState)("keep");
	const [quickForm, setQuickForm] = (0, import_react.useState)({
		mode: "call",
		datetime: localDatetimeValue(),
		agentId: "",
		phone: "",
		name: "",
		clientId: "",
		type: "Inbound",
		duration: "3",
		outcome: "Resolved",
		rating: "",
		followUpAt: "",
		channel: "SMS",
		notes: ""
	});
	const [callForm, setCallForm] = (0, import_react.useState)({
		datetime: localDatetimeValue(),
		agentId: "",
		customerId: "",
		clientId: "",
		type: "Inbound",
		duration: "3",
		outcome: "Resolved",
		rating: "",
		followUpAt: "",
		notes: ""
	});
	const [msgForm, setMsgForm] = (0, import_react.useState)({
		datetime: localDatetimeValue(),
		agentId: "",
		customerId: "",
		clientId: "",
		channel: "SMS",
		direction: "Inbound",
		subject: "",
		body: "",
		status: "Open",
		notes: ""
	});
	const [agentForm, setAgentForm] = (0, import_react.useState)({
		name: "",
		email: "",
		role: "Agent",
		status: "Active"
	});
	const [customerForm, setCustomerForm] = (0, import_react.useState)({
		name: "",
		phone: "",
		email: "",
		company: "",
		clientId: ""
	});
	const [clientForm, setClientForm] = (0, import_react.useState)({
		name: "",
		industry: "",
		phone: "",
		email: "",
		website: "",
		status: "Active",
		address: "",
		notes: ""
	});
	const [reconcilePreview, setReconcilePreview] = (0, import_react.useState)(null);
	const [reconcileAgentId, setReconcileAgentId] = (0, import_react.useState)("");
	const toast = (0, import_react.useCallback)((message, type = "info") => {
		const id = Math.random().toString(36).slice(2);
		setToasts((t) => [...t, {
			id,
			message,
			type
		}]);
		setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
	}, []);
	const refresh = (0, import_react.useCallback)(async () => {
		const next = await getAllData();
		setData({
			...next,
			messages: next.messages || []
		});
		return next;
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = readLastAgentId();
		const pool = data.agents;
		if (saved && pool.some((a) => a.id === saved)) setMeAgentId(saved);
		else if (pool[0]?.id) setMeAgentId(pool[0].id);
	}, [data.agents]);
	(0, import_react.useEffect)(() => {
		let live = true;
		refresh().catch((err) => {
			toast(err instanceof Error ? err.message : "Could not load data");
		}).finally(() => {
			if (live) setBoot(false);
		});
		return () => {
			live = false;
		};
	}, [refresh, toast]);
	function pickAgent() {
		if (meAgentId && data.agents.some((a) => a.id === meAgentId)) return meAgentId;
		return data.agents[0]?.id || "";
	}
	function setWorkingAgent(id) {
		setMeAgentId(id);
		writeLastAgentId(id);
	}
	async function onReconcileFiles(files) {
		const list = files.slice(0, 10);
		if (list.length === 0) return;
		setBusy(true);
		try {
			const allRows = [];
			const names = [];
			const dirs = /* @__PURE__ */ new Set();
			const agentIds = /* @__PURE__ */ new Set();
			for (const file of list) {
				const parsed = await parseTelecomFile(file);
				const fileAgentId = detectAgentFromFilename(file.name, data.agents);
				const fileAgentName = data.agents.find((a) => a.id === fileAgentId)?.name || "";
				if (fileAgentId) agentIds.add(fileAgentId);
				if (parsed.fileDirection === "Inbound" || parsed.fileDirection === "Outbound") dirs.add(parsed.fileDirection);
				names.push(file.name);
				for (const r of parsed.rows) allRows.push({
					...r,
					agentHint: fileAgentName || r.agentHint || parsed.generatedBy
				});
			}
			const fileDirection = dirs.size === 1 ? [...dirs][0] : null;
			const preview = buildReconcilePreviewFromRows(names.length === 1 ? names[0] : `${names.length} files`, allRows, data, data.agents, fileDirection);
			setReconcilePreview(preview);
			const uniqueAgent = agentIds.size === 1 ? [...agentIds][0] : preview.detectedAgentId || pickAgent();
			setReconcileAgentId(uniqueAgent);
			if (preview.answered === 0) toast("No answered inbound or outbound calls in these files");
			else toast(`${names.length} file${names.length === 1 ? "" : "s"} · ${preview.answered} answered`);
		} catch (err) {
			toast(err instanceof Error ? err.message : "Could not read file");
		} finally {
			setBusy(false);
		}
	}
	async function applyReconcile() {
		if (!reconcilePreview) return;
		const fixes = reconcilePreview.directionFixes || [];
		if (reconcilePreview.missing.length && !reconcileAgentId) {
			toast("Select an agent for the missing rows");
			return;
		}
		if (reconcilePreview.missing.length === 0 && fixes.length === 0) {
			toast("Nothing to apply");
			return;
		}
		setBusy(true);
		try {
			let flipped = 0;
			for (const fix of fixes) {
				const c = data.calls.find((x) => x.id === fix.callId);
				if (!c) continue;
				await saveCall({ data: {
					id: c.id,
					datetime: c.datetime,
					agentId: c.agentId,
					customerId: c.customerId,
					clientId: c.clientId,
					type: fix.to,
					duration: fix.toDuration > 0 ? fix.toDuration : c.duration,
					outcome: c.outcome,
					rating: c.rating,
					ratingScale: c.ratingScale,
					notes: c.notes,
					followUpAt: c.followUpAt,
					source: c.source === "telecom" ? "telecom" : "manual"
				} });
				flipped += 1;
			}
			let customers = data.customers.slice();
			let added = 0;
			for (const row of reconcilePreview.missing) {
				let customer = findCustomerByPhone(customers, row.phone) || null;
				if (!customer) {
					customer = await saveCustomer({ data: {
						name: row.phone,
						phone: row.phone,
						email: "",
						company: "",
						clientId: null,
						notes: ""
					} });
					customers = [...customers, customer];
				}
				await saveCall({ data: {
					datetime: row.datetime,
					agentId: matchAgentId(row.agentHint, data.agents) || reconcileAgentId,
					customerId: customer.id,
					clientId: customer.clientId,
					type: row.type,
					duration: row.durationMin,
					outcome: "Answered",
					rating: null,
					notes: row.did ? `Telecom reconcile. DID ${row.did}.` : "Telecom reconcile.",
					followUpAt: null,
					source: "telecom"
				} });
				added += 1;
			}
			if (reconcileAgentId) setWorkingAgent(reconcileAgentId);
			await refresh();
			setReconcilePreview(null);
			setModal(null);
			const bits = [];
			if (added) bits.push(`${added} added`);
			if (flipped) bits.push(`${flipped} updated`);
			toast(bits.join(" · ") || "Nothing to apply");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Reconcile failed");
		} finally {
			setBusy(false);
		}
	}
	async function patchCall(id, patch) {
		const c = data.calls.find((x) => x.id === id);
		if (!c) {
			toast("Call not found");
			return;
		}
		setBusy(true);
		try {
			await saveCall({ data: {
				id: c.id,
				datetime: c.datetime,
				agentId: patch.agentId || c.agentId || pickAgent(),
				customerId: c.customerId,
				clientId: c.clientId,
				type: c.type,
				duration: c.duration,
				outcome: patch.outcome ?? c.outcome,
				rating: patch.rating !== void 0 ? patch.rating : c.rating == null ? null : c.rating,
				ratingScale: patch.rating !== void 0 ? 10 : c.ratingScale === 10 || c.rating != null && c.rating > 5 ? 10 : c.rating == null ? void 0 : 5,
				notes: c.notes,
				followUpAt: patch.followUpAt !== void 0 ? patch.followUpAt : c.followUpAt
			} });
			await refresh();
			toast("Updated");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Update failed");
		} finally {
			setBusy(false);
		}
	}
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => {
			getAllData().then((next) => setData({
				...next,
				messages: next.messages || []
			})).catch(() => void 0);
		}, 8e3);
		return () => clearInterval(t);
	}, []);
	const agentsById = (0, import_react.useMemo)(() => agentMap(data), [data]);
	const customersById = (0, import_react.useMemo)(() => customerMap(data), [data]);
	const clientsById = (0, import_react.useMemo)(() => clientMap(data), [data]);
	const messages = data.messages || [];
	const unratedRecent = (0, import_react.useMemo)(() => getUnratedRecent(data, 2), [data]);
	const unratedGroups = (0, import_react.useMemo)(() => {
		return groupUnratedCalls(queueScope === "mine" && meAgentId ? unratedRecent.filter((c) => c.agentId === meAgentId) : unratedRecent);
	}, [
		unratedRecent,
		queueScope,
		meAgentId
	]);
	const kpis = (0, import_react.useMemo)(() => {
		const today = todayStr();
		const yest = yesterdayStr();
		const todayCalls = data.calls.filter((c) => c.datetime?.startsWith(today));
		const yestCalls = data.calls.filter((c) => c.datetime?.startsWith(yest));
		const todayMsgs = messages.filter((m) => m.datetime?.startsWith(today));
		const resolution = resolutionOf(todayCalls).percent;
		const timed = todayCalls.filter((c) => (c.duration || 0) > 0);
		const aht = timed.length ? timed.reduce((s, c) => s + (c.duration || 0), 0) / timed.length : 0;
		const allRated = data.calls.map(callRating).filter((n) => n != null);
		const allCsat = allRated.length ? allRated.reduce((s, n) => s + n, 0) / allRated.length : 0;
		const period = periodQa(data.calls, 14);
		const csat = period.avg;
		period.rated;
		const todayRatedScores = todayCalls.map(callRating).filter((n) => n != null);
		const todayCsat = todayRatedScores.length ? todayRatedScores.reduce((s, n) => s + n, 0) / todayRatedScores.length : 0;
		const delta = todayCalls.length - yestCalls.length;
		const inboundToday = todayCalls.filter((c) => (c.type || "Inbound") === "Inbound").length;
		const outboundToday = todayCalls.filter((c) => c.type === "Outbound").length;
		const callbackToday = todayCalls.filter((c) => c.type === "Callback").length;
		return {
			totalToday: todayCalls.length,
			inboundToday,
			outboundToday,
			callbackToday,
			msgsToday: todayMsgs.length,
			delta,
			resolution,
			aht,
			csat,
			ratedCount: period.rated,
			periodCalls: period.count,
			allCsat,
			allRated: allRated.length,
			todayCsat,
			todayRatedCount: todayRatedScores.length
		};
	}, [data.calls, messages]);
	const callsByDay = (0, import_react.useMemo)(() => {
		const days = [];
		for (let i = 13; i >= 0; i--) {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			const str = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
			days.push({
				label: d.toLocaleDateString("en-GB", {
					weekday: "short",
					day: "numeric"
				}),
				calls: data.calls.filter((c) => c.datetime?.startsWith(str)).length
			});
		}
		return days;
	}, [data.calls]);
	const outcomeData = (0, import_react.useMemo)(() => {
		const map = {};
		for (const c of data.calls) if (c.outcome) map[c.outcome] = (map[c.outcome] || 0) + 1;
		const entries = Object.entries(map).map(([name, value]) => ({
			name,
			value
		}));
		return entries.length ? entries : [{
			name: "No Data",
			value: 0
		}];
	}, [data.calls]);
	const dailyVolume = (0, import_react.useMemo)(() => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			const str = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
			days.push({
				label: d.toLocaleDateString("en-GB", {
					weekday: "short",
					day: "numeric"
				}),
				calls: data.calls.filter((c) => c.datetime?.startsWith(str)).length,
				messages: messages.filter((m) => m.datetime?.startsWith(str)).length
			});
		}
		return days;
	}, [data.calls, messages]);
	const ahtTrend = (0, import_react.useMemo)(() => {
		const days = [];
		for (let i = 13; i >= 0; i--) {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			const str = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
			const dayCalls = data.calls.filter((c) => c.datetime?.startsWith(str));
			const avg = dayCalls.length ? dayCalls.reduce((s, c) => s + (c.duration || 0), 0) / dayCalls.length : 0;
			days.push({
				label: d.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short"
				}),
				avg: Number(avg.toFixed(1))
			});
		}
		return days;
	}, [data.calls]);
	const agentRankings = (0, import_react.useMemo)(() => {
		return data.agents.map((a) => {
			const stats = getAgentStats(data, a.id);
			const score = stats.total ? Math.round(stats.resolutionRate * 40 + stats.csat * 10 + Math.min(stats.total, 50) - stats.avgDuration * 2 + stats.messages * 2) : stats.messages * 5;
			return {
				agent: a,
				...stats,
				score
			};
		}).sort((a, b) => b.score - a.score);
	}, [data]);
	const filteredCalls = (0, import_react.useMemo)(() => {
		let list = [...data.calls];
		const q = callSearch.toLowerCase().trim();
		if (q) list = list.filter((c) => {
			const a = agentsById[c.agentId];
			const cu = customersById[c.customerId];
			return a?.name.toLowerCase().includes(q) || cu?.name.toLowerCase().includes(q) || cu?.phone?.includes(q) || (c.notes || "").toLowerCase().includes(q);
		});
		if (callOutcome) list = list.filter((c) => c.outcome === callOutcome);
		if (callAgent) list = list.filter((c) => c.agentId === callAgent);
		if (callType) list = list.filter((c) => (c.type || "Inbound") === callType);
		list.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
		return list;
	}, [
		data.calls,
		callSearch,
		callOutcome,
		callAgent,
		agentsById,
		customersById
	]);
	const filteredMessages = (0, import_react.useMemo)(() => {
		let list = [...messages];
		const q = msgSearch.toLowerCase().trim();
		if (q) list = list.filter((m) => {
			const a = agentsById[m.agentId];
			const cu = customersById[m.customerId];
			return a?.name.toLowerCase().includes(q) || cu?.name.toLowerCase().includes(q) || (m.subject || "").toLowerCase().includes(q) || (m.body || "").toLowerCase().includes(q) || (m.notes || "").toLowerCase().includes(q);
		});
		if (msgChannel) list = list.filter((m) => m.channel === msgChannel);
		if (msgStatus) list = list.filter((m) => m.status === msgStatus);
		list.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
		return list;
	}, [
		messages,
		msgSearch,
		msgChannel,
		msgStatus,
		agentsById,
		customersById
	]);
	const filteredCustomers = (0, import_react.useMemo)(() => {
		const q = customerSearch.toLowerCase().trim();
		if (!q) return data.customers;
		return data.customers.filter((c) => {
			const clientName = c.clientId ? clientsById[c.clientId]?.name || "" : "";
			const activityNotes = getCustomerStats(data, c.id).activityNotes || "";
			return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || clientName.toLowerCase().includes(q) || activityNotes.toLowerCase().includes(q);
		});
	}, [
		data,
		customerSearch,
		clientsById
	]);
	const filteredClients = (0, import_react.useMemo)(() => {
		const q = clientSearch.toLowerCase().trim();
		if (!q) return data.clients;
		return data.clients.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.status.toLowerCase().includes(q) || (c.notes || "").toLowerCase().includes(q));
	}, [data.clients, clientSearch]);
	function openModal(kind, id) {
		setEditId(id || null);
		setExportClientStep(false);
		if (kind === "quick") {
			const defaultAgent = pickAgent();
			const prefClient = id || selectedClientId || "";
			setNameOverwrite("keep");
			setQuickForm({
				mode: "call",
				datetime: localDatetimeValue(),
				agentId: defaultAgent,
				phone: "",
				name: "",
				clientId: prefClient,
				type: "Inbound",
				duration: "3",
				outcome: "Resolved",
				rating: "",
				followUpAt: dateOffsetStr(1),
				channel: "SMS",
				notes: ""
			});
		} else if (kind === "call") if (id) {
			const c = data.calls.find((x) => x.id === id);
			if (c) setCallForm({
				datetime: c.datetime.slice(0, 16),
				agentId: c.agentId,
				customerId: c.customerId,
				clientId: c.clientId || "",
				type: c.type,
				duration: String(c.duration),
				outcome: c.outcome,
				rating: c.rating != null ? String(callRating(c) ?? "") : "",
				followUpAt: c.followUpAt || "",
				notes: c.notes || ""
			});
		} else setCallForm({
			datetime: localDatetimeValue(),
			agentId: pickAgent(),
			customerId: "",
			clientId: "",
			type: "Inbound",
			duration: "3",
			outcome: "Resolved",
			rating: "",
			followUpAt: dateOffsetStr(1),
			notes: ""
		});
		if (kind === "message") if (id) {
			const m = messages.find((x) => x.id === id);
			if (m) setMsgForm({
				datetime: m.datetime.slice(0, 16),
				agentId: m.agentId,
				customerId: m.customerId,
				clientId: m.clientId || "",
				channel: m.channel,
				direction: m.direction,
				subject: m.subject || "",
				body: m.body || "",
				status: m.status,
				notes: m.notes || ""
			});
		} else setMsgForm({
			datetime: localDatetimeValue(),
			agentId: pickAgent(),
			customerId: "",
			clientId: "",
			channel: "SMS",
			direction: "Inbound",
			subject: "",
			body: "",
			status: "Open",
			notes: ""
		});
		if (kind === "agent") if (id) {
			const a = data.agents.find((x) => x.id === id);
			if (a) setAgentForm({
				name: a.name,
				email: a.email,
				role: a.role,
				status: a.status
			});
		} else setAgentForm({
			name: "",
			email: "",
			role: "Agent",
			status: "Active"
		});
		if (kind === "customer") if (id) {
			const c = data.customers.find((x) => x.id === id);
			if (c) setCustomerForm({
				name: c.name,
				phone: c.phone,
				email: c.email,
				company: c.company,
				clientId: c.clientId || ""
			});
		} else setCustomerForm({
			name: "",
			phone: "",
			email: "",
			company: "",
			clientId: ""
		});
		if (kind === "client") if (id) {
			const c = data.clients.find((x) => x.id === id);
			if (c) setClientForm({
				name: c.name,
				industry: c.industry,
				phone: c.phone,
				email: c.email,
				website: c.website,
				status: c.status,
				address: c.address,
				notes: c.notes
			});
		} else setClientForm({
			name: "",
			industry: "",
			phone: "",
			email: "",
			website: "",
			status: "Active",
			address: "",
			notes: ""
		});
		setModal(kind);
	}
	async function onSaveCall(e) {
		e.preventDefault();
		if (!callForm.agentId || !callForm.customerId) {
			toast("Add agent and customer first");
			return;
		}
		setBusy(true);
		try {
			const clientId = callForm.clientId || null;
			await saveCall({ data: {
				id: editId || void 0,
				datetime: callForm.datetime,
				agentId: callForm.agentId,
				customerId: callForm.customerId,
				clientId,
				type: callForm.type,
				duration: parseFloat(callForm.duration) || 0,
				outcome: callForm.outcome,
				rating: callForm.rating ? parseInt(callForm.rating, 10) : null,
				ratingScale: callForm.rating ? 10 : void 0,
				notes: callForm.notes,
				followUpAt: callForm.outcome === "Follow-up" || callForm.outcome === "Escalated" ? callForm.followUpAt || dateOffsetStr(1) : null
			} });
			setWorkingAgent(callForm.agentId);
			await refresh();
			setModal(null);
			toast(editId ? "Call updated" : "Call logged");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save call");
		} finally {
			setBusy(false);
		}
	}
	async function onSaveQuick(e) {
		e.preventDefault();
		const phone = quickForm.phone.trim();
		const notes = quickForm.notes.trim();
		if (!quickForm.agentId) {
			toast("Select an agent");
			return;
		}
		if (!phone) {
			toast("Phone is required");
			return;
		}
		if (!notes) {
			toast("Notes are required");
			return;
		}
		setBusy(true);
		try {
			let customer = findCustomerByPhone(data.customers, phone) || null;
			const typedName = quickForm.name.trim();
			const clientId = quickForm.clientId || null;
			if (!customer) customer = await saveCustomer({ data: {
				name: typedName || phone,
				phone,
				email: "",
				company: clientId && clientsById[clientId] ? clientsById[clientId].name : "",
				clientId,
				notes: ""
			} });
			else {
				typedName && nameOverwrite === "replace" || typedName && typedName === customer.name || customer.name;
				const useTyped = Boolean(typedName) && typedName !== customer.name && nameOverwrite === "replace";
				const finalName = useTyped ? typedName : customer.name;
				const clientChanged = clientId !== (customer.clientId || null);
				if (useTyped || clientChanged) customer = await saveCustomer({ data: {
					id: customer.id,
					name: finalName,
					phone: customer.phone || phone,
					email: customer.email,
					company: clientId && clientsById[clientId]?.name || customer.company,
					clientId,
					notes: ""
				} });
			}
			if (quickForm.mode === "call") await saveCall({ data: {
				datetime: quickForm.datetime,
				agentId: quickForm.agentId,
				customerId: customer.id,
				clientId,
				type: quickForm.type || "Inbound",
				duration: parseFloat(quickForm.duration) || 0,
				outcome: quickForm.outcome,
				rating: quickForm.rating ? parseInt(quickForm.rating, 10) : null,
				ratingScale: quickForm.rating ? 10 : void 0,
				notes,
				followUpAt: quickForm.outcome === "Follow-up" || quickForm.outcome === "Escalated" ? quickForm.followUpAt || dateOffsetStr(1) : null
			} });
			else await saveMessage({ data: {
				datetime: quickForm.datetime,
				agentId: quickForm.agentId,
				customerId: customer.id,
				clientId,
				channel: quickForm.channel,
				direction: "Inbound",
				subject: "",
				body: notes,
				status: "Closed",
				notes: ""
			} });
			setWorkingAgent(quickForm.agentId);
			await refresh();
			setModal(null);
			toast(quickForm.mode === "call" ? "Call logged" : "Message logged");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save");
		} finally {
			setBusy(false);
		}
	}
	async function onSaveMessage(e) {
		e.preventDefault();
		if (!msgForm.agentId || !msgForm.customerId) {
			toast("Add agent and customer first");
			return;
		}
		if (!msgForm.body.trim()) {
			toast("Message body is required");
			return;
		}
		setBusy(true);
		try {
			const clientId = msgForm.clientId || null;
			await saveMessage({ data: {
				id: editId || void 0,
				datetime: msgForm.datetime,
				agentId: msgForm.agentId,
				customerId: msgForm.customerId,
				clientId,
				channel: msgForm.channel,
				direction: msgForm.direction,
				subject: msgForm.subject,
				body: msgForm.body,
				status: msgForm.status,
				notes: msgForm.notes
			} });
			await refresh();
			setModal(null);
			toast(editId ? "Message updated" : "Message logged");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save message");
		} finally {
			setBusy(false);
		}
	}
	async function onSaveAgent(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await saveAgent({ data: {
				id: editId || void 0,
				name: agentForm.name,
				email: agentForm.email,
				role: agentForm.role,
				status: agentForm.status
			} });
			await refresh();
			setModal(null);
			toast(editId ? "Agent updated" : "Agent added");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save agent");
		} finally {
			setBusy(false);
		}
	}
	async function onSaveCustomer(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const clientId = customerForm.clientId || null;
			let company = customerForm.company;
			if (clientId && clientsById[clientId] && !company) company = clientsById[clientId].name;
			await saveCustomer({ data: {
				id: editId || void 0,
				name: customerForm.name,
				phone: customerForm.phone,
				email: customerForm.email,
				company,
				clientId,
				notes: ""
			} });
			await refresh();
			setModal(null);
			toast(editId ? "Customer updated" : "Customer added");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save customer");
		} finally {
			setBusy(false);
		}
	}
	async function onSaveClient(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await saveClient({ data: {
				id: editId || void 0,
				name: clientForm.name,
				industry: clientForm.industry,
				phone: clientForm.phone,
				email: clientForm.email,
				website: clientForm.website,
				status: clientForm.status,
				address: clientForm.address,
				notes: clientForm.notes
			} });
			await refresh();
			setModal(null);
			toast(editId ? "Client updated" : "Client added");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save client");
		} finally {
			setBusy(false);
		}
	}
	function askDelete(title, message, action, done = "Deleted") {
		setConfirm({
			title,
			message,
			onConfirm: async () => {
				setBusy(true);
				try {
					await action();
					await refresh();
					toast(done);
				} catch (err) {
					toast(err instanceof Error ? err.message : "Delete failed");
				} finally {
					setBusy(false);
					setConfirm(null);
				}
			}
		});
		setModal("confirm");
	}
	function exportCsv(type, clientIdOverride) {
		const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		if (type === "calls") downloadText("Datetime,Agent,Customer,Phone,Type,Duration,Outcome,Rating,Notes\n" + data.calls.map((c) => [
			c.datetime,
			agentsById[c.agentId]?.name || "",
			customersById[c.customerId]?.name || "",
			customersById[c.customerId]?.phone || "",
			c.type,
			c.duration,
			c.outcome,
			c.rating ?? "",
			c.notes
		].map(escapeCsv).join(",")).join("\n"), `zynlo_calls_${date}.csv`, "text/csv");
		else if (type === "messages") downloadText("Datetime,Agent,Customer,Channel,Direction,Subject,Body,Status,Notes\n" + messages.map((m) => [
			m.datetime,
			agentsById[m.agentId]?.name || "",
			customersById[m.customerId]?.name || "",
			m.channel,
			m.direction,
			m.subject,
			m.body,
			m.status,
			m.notes
		].map(escapeCsv).join(",")).join("\n"), `zynlo_messages_${date}.csv`, "text/csv");
		else if (type === "agents") downloadText("Name,Email,Role,Status,Total Calls,Messages,Resolution %,Avg Duration,QA Score\n" + data.agents.map((a) => {
			const s = getAgentStats(data, a.id);
			return [
				a.name,
				a.email,
				a.role,
				a.status,
				s.total,
				s.messages,
				Math.round(s.resolutionRate * 100),
				s.avgDuration.toFixed(1),
				s.csat ? s.csat.toFixed(1) : ""
			].map(escapeCsv).join(",");
		}).join("\n"), `zynlo_agents_${date}.csv`, "text/csv");
		else if (type === "customers") downloadText("Name,Phone,Email,Client,Company,Calls,Messages,Notes,Last Contact\n" + data.customers.map((c) => {
			const s = getCustomerStats(data, c.id);
			return [
				c.name,
				c.phone,
				c.email,
				c.clientId ? clientsById[c.clientId]?.name || "" : "",
				c.company,
				s.total,
				s.messages,
				s.activityNotes,
				s.lastContact ? formatDate(s.lastContact) : ""
			].map(escapeCsv).join(",");
		}).join("\n"), `zynlo_customers_${date}.csv`, "text/csv");
		else if (type === "clients") downloadText("Company,Industry,Phone,Email,Website,Status,Contacts,Calls,Messages,Resolved,Escalated,Follow-up,Avg Duration (min),Avg QA,Last Activity,Account Notes,Activity Notes\n" + data.clients.map((c) => {
			const s = getClientStats(data, c.id);
			return [
				c.name,
				c.industry,
				c.phone,
				c.email,
				c.website,
				c.status,
				s.contacts,
				s.calls,
				s.messages,
				s.resolved,
				s.escalated,
				s.followUp,
				s.avgDuration.toFixed(1),
				s.avgQa ? s.avgQa.toFixed(1) : "",
				s.lastActivity ? formatDate(s.lastActivity) : "",
				s.accountNotes,
				s.activityNotes
			].map(escapeCsv).join(",");
		}).join("\n"), `zynlo_clients_${date}.csv`, "text/csv");
		else if (type === "client-report") {
			const pickId = clientIdOverride || exportClientName;
			const clientIds = pickId ? data.clients.filter((c) => c.id === pickId).map((c) => c.id) : data.clients.map((c) => c.id);
			if (clientIds.length === 0) {
				toast("No client selected");
				return;
			}
			for (const clientId of clientIds) {
				const client = clientsById[clientId];
				if (!client) continue;
				const s = getClientStats(data, clientId);
				const periodCalls = filterSinceDatetime(s.callList, 14);
				const periodMsgs = filterSinceDatetime(s.messageList, 14);
				const lines = [];
				lines.push(["Report Type", "Bi-weekly Client Report"].map(escapeCsv).join(","));
				lines.push(["Period", "Last 14 days"].map(escapeCsv).join(","));
				lines.push(["Generated", date].map(escapeCsv).join(","));
				lines.push("");
				lines.push("CLIENT SUMMARY");
				lines.push([
					"Company",
					"Status",
					"Industry",
					"Phone",
					"Email",
					"Website",
					"Account Notes"
				].map(escapeCsv).join(","));
				lines.push([
					client.name,
					client.status,
					client.industry,
					client.phone,
					client.email,
					client.website,
					client.notes
				].map(escapeCsv).join(","));
				lines.push("");
				lines.push("PERIOD TOTALS");
				lines.push([
					"Customers",
					"Calls (14d)",
					"Messages (14d)",
					"Calls (all)",
					"Messages (all)",
					"Resolved",
					"Escalated",
					"Follow-up",
					"Inbound (14d)",
					"Outbound (14d)",
					"Open follow-ups",
					"Avg Duration (min)",
					"Avg QA (14d)"
				].map(escapeCsv).join(","));
				const periodQaPack = periodQa(periodCalls, 4e3);
				lines.push([
					s.contacts,
					periodCalls.length,
					periodMsgs.length,
					s.calls,
					s.messages,
					periodCalls.filter((c) => c.outcome === "Resolved").length,
					periodCalls.filter((c) => c.outcome === "Escalated").length,
					periodCalls.filter((c) => c.outcome === "Follow-up").length,
					periodCalls.filter((c) => (c.type || "Inbound") === "Inbound").length,
					periodCalls.filter((c) => c.type === "Outbound").length,
					getFollowUpItems({
						...data,
						calls: periodCalls,
						messages: periodMsgs
					}).length,
					s.avgDuration.toFixed(1),
					periodQaPack.avg ? periodQaPack.avg.toFixed(1) : ""
				].map(escapeCsv).join(","));
				lines.push("");
				lines.push("CUSTOMERS");
				lines.push([
					"Name",
					"Phone",
					"Email",
					"Company",
					"Calls",
					"Messages",
					"Notes"
				].map(escapeCsv).join(","));
				for (const cu of s.contactList) {
					const cs = getCustomerStats(data, cu.id);
					lines.push([
						cu.name,
						cu.phone,
						cu.email,
						cu.company,
						cs.total,
						cs.messages,
						cs.activityNotes
					].map(escapeCsv).join(","));
				}
				if (s.contactList.length === 0) lines.push(["(none)"].map(escapeCsv).join(","));
				lines.push("");
				lines.push("CALLS (LAST 14 DAYS)");
				lines.push([
					"Datetime",
					"Agent",
					"Customer",
					"Phone",
					"Type",
					"Duration (min)",
					"Outcome",
					"QA Rating",
					"Notes"
				].map(escapeCsv).join(","));
				for (const call of periodCalls) lines.push([
					call.datetime,
					agentsById[call.agentId]?.name || "",
					customersById[call.customerId]?.name || "",
					customersById[call.customerId]?.phone || "",
					call.type,
					call.duration,
					call.outcome,
					call.rating ?? "",
					call.notes
				].map(escapeCsv).join(","));
				if (periodCalls.length === 0) lines.push(["(none)"].map(escapeCsv).join(","));
				lines.push("");
				lines.push("MESSAGES (LAST 14 DAYS)");
				lines.push([
					"Datetime",
					"Agent",
					"Customer",
					"Channel",
					"Direction",
					"Status",
					"Subject",
					"Body",
					"Notes"
				].map(escapeCsv).join(","));
				for (const m of periodMsgs) lines.push([
					m.datetime,
					agentsById[m.agentId]?.name || "",
					customersById[m.customerId]?.name || "",
					m.channel,
					m.direction,
					m.status,
					m.subject,
					m.body,
					m.notes
				].map(escapeCsv).join(","));
				if (periodMsgs.length === 0) lines.push(["(none)"].map(escapeCsv).join(","));
				const safe = client.name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40);
				downloadText(lines.join("\n"), `zynlo_client_report_${safe}_${date}.csv`, "text/csv");
			}
			setExportClientName("");
			setExportClientStep(false);
		} else if (type === "json") downloadText(JSON.stringify(data, null, 2), `zynlo_backup_${date}.json`, "application/json");
		toast("Export ready");
		setModal(null);
	}
	async function exportPdf(clientIdOverride) {
		const pickId = clientIdOverride || exportClientName;
		const clientIds = pickId ? data.clients.filter((c) => c.id === pickId).map((c) => c.id) : data.clients.map((c) => c.id);
		if (clientIds.length === 0) {
			toast("No client selected");
			return;
		}
		setBusy(true);
		try {
			for (const clientId of clientIds) {
				const client = clientsById[clientId];
				if (!client) continue;
				const s = getClientStats(data, clientId);
				await downloadClientPdf({
					client,
					contacts: s.contactList,
					calls: filterSinceDatetime(s.callList, 14),
					messages: filterSinceDatetime(s.messageList, 14),
					agentsById,
					customersById
				});
			}
			toast(clientIds.length === 1 ? "PDF ready" : `${clientIds.length} PDFs ready`);
			setExportClientName("");
			setExportClientStep(false);
			setModal(null);
		} catch (err) {
			toast(err instanceof Error ? err.message : "PDF failed");
		} finally {
			setBusy(false);
		}
	}
	const go = (id) => {
		setSection(id);
		setSidebarOpen(false);
		if (id !== "customers") setSelectedCustomerId(null);
	};
	const todayKey = todayStr();
	const todayCallsSorted = data.calls.filter((c) => c.datetime?.startsWith(todayKey)).slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	todayCallsSorted.filter((c) => (c.type || "Inbound") === "Inbound");
	todayCallsSorted.filter((c) => c.type === "Outbound");
	todayCallsSorted.filter((c) => c.type === "Callback");
	todayCallsSorted.slice(0, 8);
	const recentMsgs = messages.slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()).slice(0, 5);
	if (boot) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-[#faf7ff] p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-lg font-bold text-[#2d1b4e]",
				children: "Zynlo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-sm text-[#6b5a80]",
				children: "Loading workspace"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed left-4 top-4 z-[200] flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.3)] md:hidden",
				onClick: () => setSidebarOpen((o) => !o),
				"aria-label": "Menu",
				children: sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
			}),
			sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[90] bg-black/40 md:hidden",
				onClick: () => setSidebarOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed z-[100] flex h-full w-[260px] flex-col overflow-y-auto bg-gradient-to-b from-sidebar to-sidebar-2 px-4 py-6 transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-8 flex items-center px-2 pt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo-wordmark.png",
							alt: "ZYNLO",
							className: "h-8 w-auto max-w-[180px] object-contain object-left md:h-9"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: NAV.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => go(item.id),
								className: cn("flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium transition-all", section === item.id ? "bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.3)]" : "text-white/60 hover:bg-primary/15 hover:text-white"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 shrink-0" }), item.label]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl border border-white/10 bg-white/5 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/50",
							children: "I am"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "w-full rounded-lg border border-white/10 bg-sidebar px-2 py-2 text-sm text-white",
							value: meAgentId,
							onChange: (e) => setWorkingAgent(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Select agent"
							}), data.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: a.id,
								children: a.name
							}, a.id))]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "min-w-0 flex-1 px-4 py-4 pt-16 md:ml-[260px] md:px-8 md:py-6 md:pt-6",
				children: [
					section === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Dashboard",
							onExport: () => openModal("export"),
							primaryLabel: "Quick Log",
							onPrimary: () => openModal("quick")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-5 w-5" }),
									label: "Calls Today",
									value: String(kpis.totalToday),
									sub: `${kpis.delta >= 0 ? "+" : ""}${kpis.delta} vs yesterday`,
									breakdown: [{
										label: "Inbound",
										value: kpis.inboundToday
									}, {
										label: "Outbound",
										value: kpis.outboundToday
									}]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-5 w-5" }),
									label: "Messages Today",
									value: String(kpis.msgsToday)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-5 w-5" }),
									label: "Resolution Rate",
									value: `${kpis.resolution}%`,
									bar: kpis.resolution
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-5 w-5" }),
									label: "Avg Handle Time",
									value: formatDuration(kpis.aht)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-5 w-5" }),
									label: "Quality Assurance",
									value: kpis.ratedCount ? `${kpis.csat.toFixed(1)}/10` : "-",
									sub: kpis.ratedCount ? `${kpis.ratedCount} rated last 14 days${kpis.todayRatedCount ? ` · today ${kpis.todayCsat.toFixed(1)}` : ""}${kpis.allRated ? ` · all-time ${kpis.allCsat.toFixed(1)}` : ""}` : "No rated calls in last 14 days",
									accent: true
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold text-fg",
								children: "Work queue"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: ["mine", "team"].map((scope) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (queueScope === scope ? "border-primary bg-primary text-white" : "border-border bg-white text-fg"),
									onClick: () => setQueueScope(scope),
									children: scope === "mine" ? "Mine" : "Team"
								}, scope))
							})]
						}),
						queueScope === "mine" && !meAgentId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-primary/30 bg-purple-50 px-4 py-3 text-sm",
							children: "Choose who you are in the sidebar to see your queue."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: `Unrated QA (${unratedGroups.reduce((n, g) => n + g.calls.length, 0)})` }), unratedGroups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-5 pb-5 text-sm text-muted",
								children: "No unrated calls in the last 2 days."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-h-[70vh] divide-y divide-border overflow-y-auto overscroll-contain",
								children: unratedGroups.map((g) => {
									const who = contactBits(customersById[g.customerId]);
									const oldest = g.calls[0];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-4 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-sm font-semibold",
												children: [
													who.name,
													" ",
													who.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-primary",
														children: who.phone
													}) : null
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-0.5 text-xs text-muted",
												children: [
													g.calls.length,
													" unrated · ",
													formatDate(oldest.datetime),
													" ",
													"· ",
													agentsById[oldest.agentId]?.name || "Unassigned"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex flex-wrap gap-1.5",
												children: [
													10,
													9,
													8,
													7,
													6,
													5,
													4,
													3,
													2,
													1
												].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: busy,
													className: "min-h-11 min-w-11 rounded-lg border-2 border-border bg-white text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-50",
													onClick: () => void patchCall(oldest.id, { rating: n }),
													children: n
												}, n))
											})
										]
									}, g.key);
								})
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Calls by Day" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-[260px] p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: callsByDay,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												strokeDasharray: "3 3",
												stroke: "rgba(167,67,255,0.08)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "label",
												tick: { fontSize: 10 },
												interval: 0
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												allowDecimals: false,
												tick: { fontSize: 11 }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												dataKey: "calls",
												fill: "#a743ff",
												radius: [
													6,
													6,
													0,
													0
												]
											})
										]
									})
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Call Outcomes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-[260px] p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
										data: outcomeData,
										dataKey: "value",
										nameKey: "name",
										innerRadius: 55,
										outerRadius: 90,
										paddingAngle: 2,
										children: outcomeData.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {})] })
								})
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								title: "Calls Today",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									variant: "secondary",
									size: "sm",
									onClick: () => go("calls"),
									children: "View All"
								})
							}), todayCallsSorted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-5 pb-5 text-sm text-muted",
								children: "No calls today."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: todayCallsSorted.slice(0, 12).map((c) => {
									const cu = customersById[c.customerId];
									const who = contactBits(cu);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex w-full flex-col gap-0.5 px-5 py-3 text-left hover:bg-purple-50/60",
										onClick: () => openModal("call", c.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2 text-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: who.name
												}),
												who.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-primary",
													children: who.phone
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "soft",
													children: c.type || "Inbound"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted",
											children: [
												formatDate(c.datetime),
												" ·",
												" ",
												agentsById[c.agentId]?.name || "Agent",
												c.notes ? ` · ${shortNotes(c.notes, 70)}` : ""
											]
										})]
									}, c.id);
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								title: "Recent Messages",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									variant: "secondary",
									size: "sm",
									onClick: () => go("messages"),
									children: "View All"
								})
							}), recentMsgs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-6 py-10 text-center text-sm text-muted",
								children: "No messages yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: recentMsgs.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "flex w-full flex-col gap-1 px-5 py-3 text-left hover:bg-purple-50/60",
									onClick: () => openModal("message", m.id),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2 text-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "soft",
													children: m.channel
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: contactBits(customersById[m.customerId]).line
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted",
													children: formatDate(m.datetime)
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "line-clamp-2 text-xs text-muted",
											children: [m.subject ? `${m.subject}: ` : "", m.body]
										}),
										m.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-primary",
											children: ["Note: ", shortNotes(m.notes, 80)]
										}) : null
									]
								}, m.id))
							})] })]
						})
					] }),
					section === "calls" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Call Log",
							onExport: () => openModal("export"),
							onReconcile: () => {
								setReconcilePreview(null);
								setReconcileAgentId(pickAgent());
								openModal("reconcile");
							},
							primaryLabel: "Quick Log",
							onPrimary: () => openModal("quick")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
								value: callSearch,
								onChange: setCallSearch,
								placeholder: "Search..."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[140px]",
								value: callOutcome,
								onChange: (e) => setCallOutcome(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Outcomes"
								}), OUTCOMES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: o,
									children: o
								}, o))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[140px]",
								value: callAgent,
								onChange: (e) => setCallAgent(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Agents"
								}), data.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: a.id,
									children: a.name
								}, a.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[140px]",
								value: callType,
								onChange: (e) => setCallType(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Types"
								}), CALL_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t,
									children: t
								}, t))]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.calls.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-12 w-12" }),
							title: "No calls yet",
							description: "Log your first call to get started."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallsTable, {
							calls: filteredCalls,
							agents: agentsById,
							customers: customersById,
							onEdit: (id) => openModal("call", id),
							onDelete: (id) => askDelete("Delete Call?", "Delete this call?", () => deleteCall({ data: { id } }).then(() => void 0))
						}) })
					] }),
					section === "messages" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Messages",
							onExport: () => openModal("export"),
							primaryLabel: "Quick Log",
							onPrimary: () => openModal("quick")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
								value: msgSearch,
								onChange: setMsgSearch,
								placeholder: "Search..."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[130px]",
								value: msgChannel,
								onChange: (e) => setMsgChannel(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Channels"
								}), MESSAGE_CHANNELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[130px]",
								value: msgStatus,
								onChange: (e) => setMsgStatus(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Statuses"
								}), MESSAGE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: s
								}, s))]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-12 w-12" }),
							title: "No messages yet",
							description: "Log SMS, chat, or email conversations."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Time"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Channel"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Dir"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Agent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Customer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Message"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Notes"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredMessages.map((m) => {
									const a = agentsById[m.agentId];
									const cu = customersById[m.customerId];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border hover:bg-purple-50/60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "whitespace-nowrap px-4 py-3",
												children: formatDate(m.datetime)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "soft",
													children: m.channel
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-xs",
												children: m.direction
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: a?.name || "-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-4 py-3 font-medium",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: cu?.name || "-" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs font-medium text-primary",
													children: cu?.phone || "-"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "max-w-[220px] px-4 py-3",
												children: [m.subject ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs font-semibold",
													children: m.subject
												}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "truncate text-xs text-muted",
													children: m.body
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: msgStatusTone(m.status),
													children: m.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "max-w-[140px] truncate px-4 py-3 text-xs text-muted",
												title: m.notes || void 0,
												children: shortNotes(m.notes)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
													onEdit: () => openModal("message", m.id),
													onDelete: () => askDelete("Delete Message?", "Delete this message?", () => deleteMessage({ data: { id: m.id } }).then(() => void 0))
												})
											})
										]
									}, m.id);
								}) })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3 p-4 md:hidden",
							children: filteredMessages.map((m) => {
								const a = agentsById[m.agentId];
								const cu = customersById[m.customerId];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileCard, {
									title: contactBits(cu).line,
									subtitle: `${m.channel} · ${formatDate(m.datetime)}`,
									rows: [
										["Phone", cu?.phone || "-"],
										["Direction", m.direction],
										["Agent", a?.name || "-"],
										["Message", shortNotes(m.body, 80)],
										["Status", m.status],
										["Notes", shortNotes(m.notes, 80)]
									],
									onEdit: () => openModal("message", m.id),
									onDelete: () => askDelete("Delete Message?", "Delete this message?", () => deleteMessage({ data: { id: m.id } }).then(() => void 0))
								}, m.id);
							})
						})] }) })
					] }),
					section === "agents" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
						title: "Agents",
						onExport: () => openModal("export"),
						primaryLabel: "Add Agent",
						onPrimary: () => openModal("agent")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.agents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-12 w-12" }),
						title: "No agents yet",
						description: "Add your first agent."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden overflow-x-auto md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Agent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Calls today"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Msgs today"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Follow-ups"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Avg Time"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Resolution"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "QA week"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.agents.map((a) => {
								const s = getAgentStats(data, a.id);
								const rate = s.todayCalls ? Math.round(s.todayResolutionRate * 100) : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border hover:bg-purple-50/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { name: a.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-semibold",
													children: a.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted",
													children: a.email || "-"
												})] })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: a.role
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-semibold",
											children: s.todayCalls
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: s.todayMessages
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-semibold",
											children: s.openFollowUps
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: formatDuration(s.todayAvgDuration)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold",
													children: [rate, "%"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-1.5 w-20 overflow-hidden rounded-full bg-border",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-full rounded-full bg-primary",
														style: { width: `${rate}%` }
													})
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: s.weekRated > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-primary",
												children: ["★ ", s.weekQa.toFixed(1)]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11px] text-muted",
												children: [
													s.weekRated,
													" this week",
													s.lastWeekRated ? ` · last ${s.lastWeekQa.toFixed(1)}` : ""
												]
											})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted",
												children: "-"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: a.status === "Active" ? "strong" : "soft",
												children: a.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
												onEdit: () => openModal("agent", a.id),
												onDelete: () => askDelete("Delete Agent?", "Delete this agent?", () => deleteAgent({ data: { id: a.id } }).then(() => void 0))
											})
										})
									]
								}, a.id);
							}) })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3 p-4 md:hidden",
						children: data.agents.map((a) => {
							const s = getAgentStats(data, a.id);
							const rate = s.todayCalls ? Math.round(s.todayResolutionRate * 100) : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileCard, {
								title: a.name,
								subtitle: `${a.role} · ${a.status}`,
								rows: [
									["Calls today", String(s.todayCalls)],
									["Msgs today", String(s.todayMessages)],
									["Follow-ups", String(s.openFollowUps)],
									["Avg Time", formatDuration(s.todayAvgDuration)],
									["Resolution", `${rate}%`],
									["QA week", s.weekRated ? `★ ${s.weekQa.toFixed(1)} (${s.weekRated})` : "-"]
								],
								onEdit: () => openModal("agent", a.id),
								onDelete: () => askDelete("Delete Agent?", "Delete this agent?", () => deleteAgent({ data: { id: a.id } }).then(() => void 0))
							}, a.id);
						})
					})] }) })] }),
					section === "customers" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Customers",
							onExport: () => openModal("export"),
							primaryLabel: "Add Customer",
							onPrimary: () => openModal("customer")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
							value: customerSearch,
							onChange: setCustomerSearch,
							placeholder: "Search..."
						}), selectedCustomerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "secondary",
							onClick: () => setSelectedCustomerId(null),
							children: "All customers"
						}) : null] }),
						selectedCustomerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerTimeline, {
							customer: customersById[selectedCustomerId],
							data,
							agents: agentsById,
							clients: clientsById,
							onBack: () => setSelectedCustomerId(null),
							onEdit: () => openModal("customer", selectedCustomerId),
							onLog: () => openModal("quick"),
							onOpenCall: (id) => openModal("call", id),
							onOpenMessage: (id) => openModal("message", id),
							onMerge: (dropId) => askDelete("Merge customer?", "Move all calls and messages onto this customer and remove the duplicate.", () => mergeCustomers({ data: {
								keepId: selectedCustomerId,
								dropId
							} }).then(() => void 0), "Merged")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-12 w-12" }),
							title: "No customers yet",
							description: "Add your first customer."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Phone"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Email"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Client"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Calls"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Msgs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Notes"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Last Contact"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredCustomers.map((c) => {
									const s = getCustomerStats(data, c.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "cursor-pointer border-t border-border hover:bg-purple-50/60",
										onClick: () => setSelectedCustomerId(c.id),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-semibold",
												children: c.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: c.phone
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: c.email || "-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: customerCompanyLabel(c, clientsById)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-semibold",
												children: s.total
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: s.messages
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "max-w-[200px] truncate px-4 py-3 text-xs text-muted",
												title: s.activityNotes || void 0,
												children: shortNotes(s.activityNotes)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: s.lastContact ? formatDate(s.lastContact) : "Never"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												onClick: (e) => e.stopPropagation(),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
													onEdit: () => openModal("customer", c.id),
													onDelete: () => askDelete("Delete Customer?", "Delete this customer?", () => deleteCustomer({ data: { id: c.id } }).then(() => void 0))
												})
											})
										]
									}, c.id);
								}) })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3 p-4 md:hidden",
							children: filteredCustomers.map((c) => {
								const s = getCustomerStats(data, c.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileCard, {
									title: c.name,
									subtitle: c.phone,
									rows: [
										["Email", c.email || "-"],
										["Client", customerCompanyLabel(c, clientsById)],
										["Calls", String(s.total)],
										["Messages", String(s.messages)],
										["Notes", shortNotes(s.activityNotes, 80)],
										["Last", s.lastContact ? formatDate(s.lastContact) : "Never"]
									],
									onEdit: () => openModal("customer", c.id),
									onDelete: () => askDelete("Delete Customer?", "Delete this customer?", () => deleteCustomer({ data: { id: c.id } }).then(() => void 0))
								}, c.id);
							})
						})] }) })
					] }),
					section === "clients" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Clients",
							onExport: () => openModal("export"),
							primaryLabel: "Add Client",
							onPrimary: () => openModal("client")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
							value: clientSearch,
							onChange: setClientSearch,
							placeholder: "Search clients..."
						}), selectedClientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "secondary",
							onClick: () => setSelectedClientId(null),
							children: "All clients"
						}) : null] }),
						!selectedClientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.clients.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-12 w-12" }),
							title: "No clients yet",
							description: "Add your first client."
						}) : filteredClients.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-12 w-12" }),
							title: "No matches",
							description: "Try a different search."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Company"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Customers"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Calls"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Messages"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Notes"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Last activity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredClients.map((c) => {
									const s = getClientStats(data, c.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "cursor-pointer border-t border-border hover:bg-purple-50/60",
										onClick: () => setSelectedClientId(c.id),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-4 py-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-semibold",
													children: c.name
												}), c.industry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted",
													children: c.industry
												}) : null]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: c.status === "Active" ? "strong" : "soft",
													children: c.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-semibold",
												children: s.contacts
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: s.calls
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: s.messages
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "max-w-[200px] truncate px-4 py-3 text-xs text-muted",
												title: s.allNotes || void 0,
												children: shortNotes(s.allNotes)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-xs",
												children: s.lastActivity ? formatDate(s.lastActivity) : "Never"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												onClick: (e) => e.stopPropagation(),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
														variant: "secondary",
														onClick: () => setSelectedClientId(c.id),
														children: "Open"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
														onEdit: () => openModal("client", c.id),
														onDelete: () => askDelete("Delete Client?", "Delete this client?", () => deleteClient({ data: { id: c.id } }).then(() => void 0))
													})]
												})
											})
										]
									}, c.id);
								}) })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3 p-4 md:hidden",
							children: filteredClients.map((c) => {
								const s = getClientStats(data, c.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm",
									onClick: () => setSelectedClientId(c.id),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-2 flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-bold text-fg",
												children: c.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted",
												children: c.industry || "Company"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: c.status === "Active" ? "strong" : "soft",
												children: c.status
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-2 text-center text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg bg-purple-50 p-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-bold text-primary",
														children: s.contacts
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-muted",
														children: "Customers"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg bg-purple-50 p-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-bold text-primary",
														children: s.calls
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-muted",
														children: "Calls"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg bg-purple-50 p-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-bold text-primary",
														children: s.messages
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-muted",
														children: "Messages"
													})]
												})
											]
										}),
										s.allNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 line-clamp-2 text-xs text-muted",
											children: s.allNotes
										}) : null
									]
								}, c.id);
							})
						})] }) }) : (() => {
							const client = clientsById[selectedClientId];
							if (!client) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-12 w-12" }),
								title: "Client not found",
								description: "Go back to the client list."
							}) });
							const s = getClientStats(data, client.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mb-2 flex flex-wrap items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
														className: "text-xl font-bold text-fg",
														children: client.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														tone: client.status === "Active" ? "strong" : "soft",
														children: client.status
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted",
													children: [
														client.industry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: client.industry }) : null,
														client.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: client.phone }) : null,
														client.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: client.email }) : null,
														client.website ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: client.website }) : null
													]
												}),
												client.notes?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-3 whitespace-pre-wrap text-sm text-fg",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-semibold text-muted",
														children: ["Notes:", " "]
													}), client.notes]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-3 text-sm text-muted",
													children: "No account notes"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex shrink-0 flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
													variant: "secondary",
													onClick: () => openModal("client", client.id),
													children: "Edit"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
													variant: "secondary",
													onClick: () => openModal("quick", client.id),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Quick Log"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
													variant: "secondary",
													onClick: () => exportCsv("client-report", client.id),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "CSV"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
													onClick: () => exportPdf(client.id),
													disabled: busy,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), busy ? "Preparing PDF" : "PDF report"]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-3 border-t border-border p-4 sm:grid-cols-3 lg:grid-cols-6",
										children: [
											["Customers", s.contacts],
											["Calls", s.calls],
											["Messages", s.messages],
											["Resolved", s.resolved],
											["Escalated", s.escalated],
											["Avg handle", formatDuration(s.avgDuration)]
										].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl bg-purple-50 px-3 py-3 text-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-lg font-bold text-primary",
												children: value
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: label
											})]
										}, String(label)))
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: `Customers (${s.contacts})` }), s.contactList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "px-5 pb-5 text-sm text-muted",
										children: "No customers linked to this client yet."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-h-80 overflow-auto",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Name"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Phone"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Calls"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Msgs"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Notes"
													})
												]
											}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: s.contactList.map((cu) => {
												const cs = getCustomerStats(data, cu.id);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-4 py-2 font-semibold",
															children: cu.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-4 py-2",
															children: cu.phone
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-4 py-2",
															children: cs.total
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-4 py-2",
															children: cs.messages
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "max-w-[140px] truncate px-4 py-2 text-xs text-muted",
															title: cs.activityNotes || void 0,
															children: shortNotes(cs.activityNotes)
														})
													]
												}, cu.id);
											}) })]
										})
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: `Calls (${s.calls})` }), s.callList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "px-5 pb-5 text-sm text-muted",
										children: "No calls for this client yet."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "max-h-96 overflow-auto",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "When"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Agent"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Customer"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Phone"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Type"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Duration"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Outcome"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Notes"
													})
												]
											}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: s.callList.slice(0, 50).map((call) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-t border-border",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-xs",
														children: formatDate(call.datetime)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: agentsById[call.agentId]?.name || "-"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-4 py-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: customersById[call.customerId]?.name || "-" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-xs font-medium text-primary",
															children: customersById[call.customerId]?.phone || "-"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2",
														children: customersById[call.customerId]?.phone || "-"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: call.type
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: formatDuration(call.duration)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															tone: call.outcome === "Resolved" ? "strong" : "soft",
															children: call.outcome
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "max-w-[160px] truncate px-4 py-2 text-xs text-muted",
														title: call.notes || void 0,
														children: shortNotes(call.notes)
													})
												]
											}, call.id)) })]
										}), s.callList.length > 50 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border px-4 py-2 text-xs text-muted",
											children: [
												"Showing 50 of ",
												s.callList.length,
												". Use Bi-weekly CSV for the full export."
											]
										}) : null]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: `Messages (${s.messages})` }), s.messageList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "px-5 pb-5 text-sm text-muted",
										children: "No messages for this client yet."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-h-80 overflow-auto",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "When"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Agent"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Customer"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Channel"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Status"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-4 py-2",
														children: "Notes"
													})
												]
											}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: s.messageList.slice(0, 50).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-t border-border",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-xs",
														children: formatDate(m.datetime)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: agentsById[m.agentId]?.name || "-"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-4 py-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: customersById[m.customerId]?.name || "-" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-xs font-medium text-primary",
															children: customersById[m.customerId]?.phone || "-"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: m.channel
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: m.status
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "max-w-[160px] truncate px-4 py-2 text-xs text-muted",
														title: m.notes || void 0,
														children: shortNotes(m.notes)
													})
												]
											}, m.id)) })]
										})
									})] })
								]
							});
						})()
					] }),
					section === "analytics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Analytics",
							onExport: () => openModal("export")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 overflow-x-auto border-b border-border",
							children: [
								["performance", "Performance"],
								["trends", "Trends"],
								["rank", "Agent Rankings"]
							].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setAnalyticsTab(id),
								className: cn("shrink-0 border-b-2 px-5 py-2.5 text-sm font-semibold transition", analyticsTab === id ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary"),
								children: label
							}, id))
						}),
						analyticsTab === "performance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Daily Volume (Last 7 Days)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-[280px] p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
										data: dailyVolume,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												strokeDasharray: "3 3",
												stroke: "rgba(167,67,255,0.08)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "label",
												tick: { fontSize: 11 }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												allowDecimals: false,
												tick: { fontSize: 11 }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
												type: "monotone",
												dataKey: "calls",
												name: "Calls",
												stroke: "#a743ff",
												strokeWidth: 2,
												dot: { fill: "#a743ff" }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
												type: "monotone",
												dataKey: "messages",
												name: "Messages",
												stroke: "#8a2be2",
												strokeWidth: 2,
												strokeDasharray: "4 4",
												dot: { fill: "#8a2be2" }
											})
										]
									})
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Outcome Breakdown" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-[280px] p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
										data: outcomeData,
										dataKey: "value",
										nameKey: "name",
										outerRadius: 100,
										children: outcomeData.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {})] })
								})
							})] })]
						}),
						analyticsTab === "trends" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Average Handle Time Trend" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-[300px] p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
									data: ahtTrend,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											strokeDasharray: "3 3",
											stroke: "rgba(167,67,255,0.08)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "label",
											tick: { fontSize: 11 }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "avg",
											name: "Avg mins",
											stroke: "#8a2be2",
											strokeWidth: 2,
											dot: { fill: "#8a2be2" }
										})
									]
								})
							})
						})] }),
						analyticsTab === "rank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Top Performing Agents" }), agentRankings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-12 w-12" }),
							title: "No data yet"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Rank"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Agent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Calls"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Msgs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Resolution"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Avg Time"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "QA"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Score"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: agentRankings.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-lg font-bold text-primary",
											children: ["#", i + 1]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { name: r.agent.name }), r.agent.name]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: r.total
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: r.messages
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3",
											children: [Math.round(r.resolutionRate * 100), "%"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: formatDuration(r.avgDuration)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: r.csat ? r.csat.toFixed(1) : "-"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-bold",
											children: r.score
										})
									]
								}, r.agent.id)) })]
							})
						})] })
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "quick",
				onClose: () => setModal(null),
				title: "Quick Log",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					form: "quick-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "quick-form",
					onSubmit: onSaveQuick,
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.mode === "call" ? "border-primary bg-primary text-white" : "border-border bg-white text-fg"),
								onClick: () => setQuickForm((f) => ({
									...f,
									mode: "call"
								})),
								children: "Call"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.mode === "message" ? "border-primary bg-primary text-white" : "border-border bg-white text-fg"),
								onClick: () => setQuickForm((f) => ({
									...f,
									mode: "message"
								})),
								children: "Message"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								type: "tel",
								className: inputClass,
								value: quickForm.phone,
								onChange: (e) => {
									const phone = e.target.value;
									const match = findCustomerByPhone(data.customers, phone);
									setQuickForm((f) => ({
										...f,
										phone,
										name: f.name.trim() ? f.name : match?.name || "",
										clientId: f.clientId ? f.clientId : match?.clientId || ""
									}));
								},
								placeholder: "Customer phone"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								value: quickForm.name,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									name: e.target.value
								})),
								placeholder: "Customer name (saved with this log)"
							})
						}),
						(() => {
							const match = findCustomerByPhone(data.customers, quickForm.phone);
							if (!match || !quickForm.name.trim()) return null;
							if (quickForm.name.trim() === match.name) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 rounded-xl border border-primary/30 bg-purple-50 p-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold",
									children: [
										"This number is ",
										match.name,
										". Use the new name?"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (nameOverwrite === "keep" ? "border-primary bg-primary text-white" : "border-border bg-white"),
										onClick: () => setNameOverwrite("keep"),
										children: ["Keep ", match.name]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (nameOverwrite === "replace" ? "border-primary bg-primary text-white" : "border-border bg-white"),
										onClick: () => setNameOverwrite("replace"),
										children: ["Save as ", quickForm.name.trim()]
									})]
								})]
							});
						})(),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Agent *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								required: true,
								className: inputClass,
								value: quickForm.agentId,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									agentId: e.target.value
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select agent"
								}), data.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: a.id,
									children: a.name
								}, a.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: inputClass,
								value: quickForm.clientId,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									clientId: e.target.value
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "None"
								}), data.clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						}),
						quickForm.mode === "call" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Type of call",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: inputClass,
									value: quickForm.type,
									onChange: (e) => setQuickForm((f) => ({
										...f,
										type: e.target.value
									})),
									children: CALL_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: t,
										children: t
									}, t))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Duration (min)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputClass,
									value: quickForm.duration,
									onChange: (e) => setQuickForm((f) => ({
										...f,
										duration: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Outcome",
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: OUTCOMES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.outcome === o ? "border-primary bg-primary text-white" : "border-border bg-white text-fg"),
										onClick: () => setQuickForm((f) => ({
											...f,
											outcome: o,
											followUpAt: o === "Follow-up" || o === "Escalated" ? f.followUpAt || dateOffsetStr(1) : f.followUpAt
										})),
										children: o
									}, o))
								})
							}),
							(quickForm.outcome === "Follow-up" || quickForm.outcome === "Escalated") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Follow-up due",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)]",
									value: quickForm.followUpAt,
									onChange: (e) => setQuickForm((f) => ({
										...f,
										followUpAt: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "QA score /10",
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										"",
										"10",
										"9",
										"8",
										"7",
										"6",
										"5",
										"4",
										"3",
										"2",
										"1"
									].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 min-w-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.rating === r ? "border-primary bg-primary text-white" : "border-border bg-white text-fg"),
										onClick: () => setQuickForm((f) => ({
											...f,
											rating: r
										})),
										children: r ? r : "Later"
									}, r || "none"))
								})
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Channel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: inputClass,
								value: quickForm.channel,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									channel: e.target.value
								})),
								children: MESSAGE_CHANNELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "When",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "datetime-local",
								className: inputClass,
								value: quickForm.datetime,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									datetime: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes *",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								required: true,
								className: inputClass + " min-h-[90px]",
								value: quickForm.notes,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									notes: e.target.value
								})),
								placeholder: "Ticket ID, summary, next step…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "sm:col-span-2 text-xs text-muted",
							children: "One step: saves to the shared call/message log. Existing numbers are matched automatically; new numbers create a customer."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "call",
				onClose: () => setModal(null),
				title: editId ? "Edit Call" : "Log New Call",
				wide: true,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					form: "call-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Call"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "call-form",
					onSubmit: onSaveCall,
					className: "space-y-4",
					children: [
						(!data.agents.length || !data.customers.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-[10px] border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800",
							children: "Add an agent and customer first."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Date & Time *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "datetime-local",
										required: true,
										className: inputClass,
										value: callForm.datetime,
										onChange: (e) => setCallForm((f) => ({
											...f,
											datetime: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Agent *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										required: true,
										className: inputClass,
										value: callForm.agentId,
										onChange: (e) => setCallForm((f) => ({
											...f,
											agentId: e.target.value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select agent"
										}), data.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: a.id,
											children: a.name
										}, a.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Customer *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										required: true,
										className: inputClass,
										value: callForm.customerId,
										onChange: (e) => {
											const cid = e.target.value;
											const cu = customersById[cid];
											setCallForm((f) => ({
												...f,
												customerId: cid,
												clientId: f.clientId ? f.clientId : cu?.clientId || ""
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select customer"
										}), data.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Client",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: inputClass,
										value: callForm.clientId,
										onChange: (e) => setCallForm((f) => ({
											...f,
											clientId: e.target.value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "None"
										}), data.clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: inputClass,
										value: callForm.type,
										onChange: (e) => setCallForm((f) => ({
											...f,
											type: e.target.value
										})),
										children: CALL_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Duration (mins) *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 0,
										step: .1,
										required: true,
										className: inputClass,
										value: callForm.duration,
										onChange: (e) => setCallForm((f) => ({
											...f,
											duration: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Outcome *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										required: true,
										className: inputClass,
										value: callForm.outcome,
										onChange: (e) => setCallForm((f) => ({
											...f,
											outcome: e.target.value,
											followUpAt: e.target.value === "Follow-up" || e.target.value === "Escalated" ? f.followUpAt || dateOffsetStr(1) : f.followUpAt
										})),
										children: OUTCOMES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: o }, o))
									})
								}),
								(callForm.outcome === "Follow-up" || callForm.outcome === "Escalated") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Follow-up due",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)]",
										value: callForm.followUpAt,
										onChange: (e) => setCallForm((f) => ({
											...f,
											followUpAt: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "QA score /10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: [
											"",
											"10",
											"9",
											"8",
											"7",
											"6",
											"5",
											"4",
											"3",
											"2",
											"1"
										].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-11 min-w-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (callForm.rating === r ? "border-primary bg-primary text-white" : "border-border bg-white text-fg"),
											onClick: () => setCallForm((f) => ({
												...f,
												rating: r
											})),
											children: r ? r : "Later"
										}, r || "none"))
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: inputClass + " min-h-[80px] resize-y",
								value: callForm.notes,
								onChange: (e) => setCallForm((f) => ({
									...f,
									notes: e.target.value
								})),
								placeholder: "Notes"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "message",
				onClose: () => setModal(null),
				title: editId ? "Edit Message" : "Log Message",
				wide: true,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					form: "message-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Message"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "message-form",
					onSubmit: onSaveMessage,
					className: "space-y-4",
					children: [
						(!data.agents.length || !data.customers.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-[10px] border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800",
							children: "Add an agent and customer first."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Date & Time *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "datetime-local",
										required: true,
										className: inputClass,
										value: msgForm.datetime,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											datetime: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Agent *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										required: true,
										className: inputClass,
										value: msgForm.agentId,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											agentId: e.target.value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select agent"
										}), data.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: a.id,
											children: a.name
										}, a.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Customer *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										required: true,
										className: inputClass,
										value: msgForm.customerId,
										onChange: (e) => {
											const cid = e.target.value;
											const cu = customersById[cid];
											setMsgForm((f) => ({
												...f,
												customerId: cid,
												clientId: f.clientId ? f.clientId : cu?.clientId || ""
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select customer"
										}), data.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Client",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: inputClass,
										value: msgForm.clientId,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											clientId: e.target.value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "None"
										}), data.clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Channel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: inputClass,
										value: msgForm.channel,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											channel: e.target.value
										})),
										children: MESSAGE_CHANNELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Direction",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: inputClass,
										value: msgForm.direction,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											direction: e.target.value
										})),
										children: MESSAGE_DIRECTIONS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: d }, d))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Status",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: inputClass,
										value: msgForm.status,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											status: e.target.value
										})),
										children: MESSAGE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Subject",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										value: msgForm.subject,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											subject: e.target.value
										})),
										placeholder: ""
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Message body *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								required: true,
								className: inputClass + " min-h-[100px] resize-y",
								value: msgForm.body,
								onChange: (e) => setMsgForm((f) => ({
									...f,
									body: e.target.value
								})),
								placeholder: "Message"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: inputClass + " min-h-[60px] resize-y",
								value: msgForm.notes,
								onChange: (e) => setMsgForm((f) => ({
									...f,
									notes: e.target.value
								})),
								placeholder: "Notes"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "agent",
				onClose: () => setModal(null),
				title: editId ? "Edit Agent" : "Add Agent",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					form: "agent-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Agent"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "agent-form",
					onSubmit: onSaveAgent,
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Full Name *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								className: inputClass,
								value: agentForm.name,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									name: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								className: inputClass,
								value: agentForm.email,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									email: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Role",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: inputClass,
								value: agentForm.role,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									role: e.target.value
								})),
								children: AGENT_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: r }, r))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: inputClass,
								value: agentForm.status,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									status: e.target.value
								})),
								children: AGENT_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "customer",
				onClose: () => setModal(null),
				title: editId ? "Edit Customer" : "Add Customer",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					form: "customer-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Customer"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "customer-form",
					onSubmit: onSaveCustomer,
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								className: inputClass,
								value: customerForm.name,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									name: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								type: "tel",
								className: inputClass,
								value: customerForm.phone,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									phone: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								className: inputClass,
								value: customerForm.email,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									email: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: inputClass,
								value: customerForm.clientId,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									clientId: e.target.value
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "None"
								}), data.clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Company",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								value: customerForm.company,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									company: e.target.value
								})),
								placeholder: ""
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "client",
				onClose: () => setModal(null),
				title: editId ? "Edit Client" : "Add Client",
				wide: true,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					form: "client-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Client"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "client-form",
					onSubmit: onSaveClient,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Company Name *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										className: inputClass,
										value: clientForm.name,
										onChange: (e) => setClientForm((f) => ({
											...f,
											name: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Industry",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										value: clientForm.industry,
										onChange: (e) => setClientForm((f) => ({
											...f,
											industry: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Phone",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "tel",
										className: inputClass,
										value: clientForm.phone,
										onChange: (e) => setClientForm((f) => ({
											...f,
											phone: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "email",
										className: inputClass,
										value: clientForm.email,
										onChange: (e) => setClientForm((f) => ({
											...f,
											email: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Website",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "url",
										className: inputClass,
										value: clientForm.website,
										onChange: (e) => setClientForm((f) => ({
											...f,
											website: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Status",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: inputClass,
										value: clientForm.status,
										onChange: (e) => setClientForm((f) => ({
											...f,
											status: e.target.value
										})),
										children: CLIENT_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: inputClass + " min-h-[70px]",
								value: clientForm.address,
								onChange: (e) => setClientForm((f) => ({
									...f,
									address: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: inputClass + " min-h-[70px]",
								value: clientForm.notes,
								onChange: (e) => setClientForm((f) => ({
									...f,
									notes: e.target.value
								})),
								placeholder: "Notes"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "reconcile",
				onClose: () => {
					setModal(null);
					setReconcilePreview(null);
				},
				title: "Reconcile answered calls",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => {
						setModal(null);
						setReconcilePreview(null);
					},
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => void applyReconcile(),
					disabled: busy || !reconcilePreview || reconcilePreview.missing.length === 0 && !(reconcilePreview.directionFixes || []).length,
					children: busy ? "Saving" : [reconcilePreview?.missing.length ? `Add ${reconcilePreview.missing.length}` : "", (reconcilePreview?.directionFixes || []).length ? `Update ${(reconcilePreview?.directionFixes || []).length}` : ""].filter(Boolean).join(" · ") || "Apply"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Upload up to 10 Cloud Telecom CSVs at once. Incoming files stay inbound. Outgoing files stay outbound. A real inbound and a real outbound on the same number are two calls. Same direction plus same phone within 10 minutes is one call. Existing logs only get matching-direction handle time, or a direction fix when you upload one direction only. Notes, outcome, and QA stay as they are."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-purple-50 px-4 py-6 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "mb-2 h-6 w-6 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold",
									children: "Choose up to 10 CSVs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 text-xs text-muted",
									children: "Incoming and outgoing files together. Duration updates AHT."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									multiple: true,
									accept: ".csv,.pdf,text/csv,application/pdf",
									className: "sr-only",
									onChange: (e) => {
										const files = Array.from(e.target.files || []);
										e.target.value = "";
										if (files.length) onReconcileFiles(files);
									}
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Agent for new rows",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: inputClass,
								value: reconcileAgentId,
								onChange: (e) => setReconcileAgentId(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select agent"
								}), data.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: a.id,
									children: a.name
								}, a.id))]
							}), reconcilePreview?.detectedAgentName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-primary",
								children: ["Detected ", reconcilePreview.detectedAgentName]
							}) : null]
						}),
						reconcilePreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.missingInbound.length
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-muted",
												children: "Inbound missing"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.missingOutbound.length
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-muted",
												children: "Outbound missing"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.alreadyInbound
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-muted",
												children: "Inbound kept"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.alreadyOutbound
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-muted",
												children: "Outbound kept"
											})]
										})
									]
								}),
								(reconcilePreview.directionFixes || []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-primary/30 bg-purple-50 px-3 py-2 text-sm",
									children: [
										(reconcilePreview.directionFixes || []).length,
										" existing call",
										(reconcilePreview.directionFixes || []).length === 1 ? "" : "s",
										" ",
										"will update direction and/or handle time only.",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 max-h-28 overflow-y-auto text-xs text-muted",
											children: (reconcilePreview.directionFixes || []).slice(0, 20).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												f.phone,
												f.from !== f.to ? ` · ${f.from} → ${f.to}` : "",
												f.toDuration ? ` · ${f.fromDuration.toFixed(1)} → ${f.toDuration.toFixed(1)} min` : ""
											] }, f.callId))
										})
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted",
									children: [
										reconcilePreview.filename,
										" · ",
										reconcilePreview.answered,
										" ",
										"answered · ",
										reconcilePreview.skipped,
										" skipped",
										reconcilePreview.detectedDirection ? ` · ${reconcilePreview.detectedDirection.toLowerCase()}` : ""
									]
								}),
								reconcilePreview.missing.length === 0 && !(reconcilePreview.directionFixes || []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted",
									children: "Every answered inbound and outbound call is already in the log."
								}) : reconcilePreview.missing.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted",
									children: "No new rows. Direction on existing calls will be updated."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
									children: [["Inbound", reconcilePreview.missingInbound], ["Outbound", reconcilePreview.missingOutbound]].map(([label, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted",
											children: [
												label,
												" · ",
												list.length
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "max-h-48 overflow-y-auto overscroll-contain",
											children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "px-3 py-4 text-xs text-muted",
												children: "None missing"
											}) : list.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "border-b border-border px-3 py-2 text-sm last:border-b-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-semibold",
													children: row.phone
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted",
													children: [
														formatDate(row.datetime),
														" · ",
														row.durationRaw,
														row.agentHint ? ` · ${row.agentHint}` : ""
													]
												})]
											}, row.phone + row.datetime + row.type))
										})]
									}, label))
								})
							]
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "export",
				onClose: () => setModal(null),
				title: "Export Data",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3",
					children: [
						[
							"client-pdf",
							"Client PDF report",
							"Branded 14-day performance pack for the account"
						],
						[
							"client-report",
							"All client packs (CSV)",
							"One file per client - last 14 days"
						],
						[
							"clients",
							"Clients summary (CSV)",
							"All clients with status, counts, notes"
						],
						[
							"calls",
							"Calls (CSV)",
							"Call log export"
						],
						[
							"messages",
							"Messages (CSV)",
							"Message log export"
						],
						[
							"agents",
							"Agents (CSV)",
							"Agent export"
						],
						[
							"customers",
							"Customers (CSV)",
							"Customer export"
						],
						[
							"json",
							"Full Backup (JSON)",
							"Complete backup"
						]
					].map(([key, title, desc]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex items-start gap-3 rounded-xl border-2 border-border p-4 text-left transition hover:border-primary hover:bg-bg",
						onClick: () => key === "client-pdf" ? exportPdf() : exportCsv(key),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mt-0.5 h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-bold",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: desc
						})] })]
					}, key))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "confirm" && !!confirm,
				onClose: () => {
					setModal(null);
					setConfirm(null);
				},
				title: confirm?.title || "Confirm",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "secondary",
					onClick: () => {
						setModal(null);
						setConfirm(null);
					},
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "danger",
					disabled: busy,
					onClick: () => confirm?.onConfirm(),
					children: busy ? "Working…" : "Delete"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm text-muted",
					children: confirm?.message
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastStack, {
				toasts,
				onDismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id))
			})
		]
	});
}
function SectionView({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "animate-fade-in space-y-5 md:space-y-6",
		children
	});
}
function CustomerTimeline({ customer, data, agents, clients, onBack, onEdit, onLog, onOpenCall, onOpenMessage, onMerge }) {
	if (!customer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-12 w-12" }),
		title: "Customer not found",
		description: "Go back to the list."
	}) });
	const stats = getCustomerStats(data, customer.id);
	const items = customerTimeline(data, customer.id);
	const dupes = customersSharingPhone(data.customers, customer.phone, customer.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-bold",
							children: customer.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: customer.phone || "No phone" }),
								customer.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: customer.email }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: customerCompanyLabel(customer, clients) })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:max-w-md",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-purple-50 p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-primary",
										children: stats.total
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted",
										children: "Calls"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-purple-50 p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-primary",
										children: stats.messages
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted",
										children: "Messages"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-purple-50 p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-primary",
										children: stats.qaScore ? stats.qaScore.toFixed(1) : "-"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted",
										children: "QA"
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "secondary",
							onClick: onBack,
							children: "Back"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "secondary",
							onClick: onEdit,
							children: "Edit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
							onClick: onLog,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Quick Log"]
						})
					]
				})]
			}) }),
			dupes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					children: "Same phone number"
				}), dupes.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						d.name,
						" · ",
						d.phone
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "secondary",
						onClick: () => onMerge(d.id),
						children: "Merge into this"
					})]
				}, d.id))]
			}) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Timeline" }), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-5 pb-5 text-sm text-muted",
				children: "No activity yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full flex-col gap-1 px-5 py-3 text-left hover:bg-purple-50/60",
					onClick: () => item.kind === "call" ? onOpenCall(item.id) : onOpenMessage(item.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: item.kind === "call" ? "strong" : "soft",
								children: item.kind === "call" ? "Call" : "Message"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: item.title
							}),
							callRating(item) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-primary",
								children: [callRating(item), "/10"]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: formatDate(item.datetime)
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [item.detail ? `${item.detail} · ` : "", shortNotes(item.notes, 140)]
					})]
				}, item.kind + item.id))
			})] })
		]
	});
}
function Header({ title, onExport, onReconcile, primaryLabel, onPrimary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold tracking-tight md:text-[28px]",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-wrap gap-2 sm:w-auto",
			children: [
				onExport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "secondary",
					className: "flex-1 sm:flex-none",
					onClick: onExport,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export"]
				}),
				onReconcile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "secondary",
					className: "flex-1 sm:flex-none",
					onClick: onReconcile,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-4 w-4" }), " Reconcile"]
				}),
				primaryLabel && onPrimary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					className: "flex-1 sm:flex-none",
					onClick: onPrimary,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
						" ",
						primaryLabel
					]
				})
			]
		})]
	});
}
function Kpi({ icon, label, value, sub, bar, accent, breakdown }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-fade-in rounded-2xl border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(167,67,255,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(167,67,255,0.1)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", accent ? "bg-gradient-to-br from-primary to-primary-light text-white" : "bg-purple-100 text-primary"),
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold uppercase tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[28px] font-bold leading-none",
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-xs font-semibold text-primary",
				children: sub
			}),
			breakdown && breakdown.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2 " + (breakdown.length >= 3 ? "grid-cols-3" : "grid-cols-2"),
				children: breakdown.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-purple-50 px-2.5 py-2 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-base font-bold text-primary",
						children: row.value
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold uppercase tracking-wide text-muted",
						children: row.label
					})]
				}, row.label))
			}),
			typeof bar === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-primary transition-all",
					style: { width: `${bar}%` }
				})
			})
		]
	});
}
function Toolbar({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
		children
	});
}
function SearchBox({ value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-w-0 flex-1 sm:max-w-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: inputClass + " pl-9",
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder
		})]
	});
}
function RowActions({ onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onEdit,
			className: "flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-bg",
			"aria-label": "Edit",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onDelete,
			className: "flex h-8 w-8 items-center justify-center rounded-lg text-purple-700 hover:bg-purple-50",
			"aria-label": "Delete",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
		})]
	});
}
function MobileCard({ title, subtitle, rows, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-white p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-base font-bold",
				children: title
			}),
			subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 text-xs text-muted",
				children: subtitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: rows.map(([l, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-xs font-semibold uppercase tracking-wide text-muted",
						children: l
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-right font-medium",
						children: v
					})]
				}, l))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex justify-end gap-2 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					size: "sm",
					variant: "secondary",
					onClick: onEdit,
					children: "Edit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					size: "sm",
					variant: "danger",
					onClick: onDelete,
					children: "Delete"
				})]
			})
		]
	});
}
function CallsTable({ calls, agents, customers, onEdit, onDelete, compact }) {
	if (!calls.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: compact ? "px-1 py-3 text-center text-xs text-muted" : "px-6 py-10 text-center text-sm text-muted",
		children: compact ? "None today" : "No matching calls"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden overflow-x-auto md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Time"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Agent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Customer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Phone"
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Duration"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Outcome"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "QA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Notes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3",
						children: "Actions"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: calls.map((c) => {
				const a = agents[c.agentId];
				const cu = customers[c.customerId];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-purple-50/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "whitespace-nowrap px-4 py-3",
							children: formatDate(c.datetime)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { name: a?.name || "?" }), a?.name || "Unknown"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: cu?.name || "Unknown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-medium text-primary",
								children: cu?.phone || "-"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "whitespace-nowrap px-4 py-3 font-medium text-primary",
							children: cu?.phone || "-"
						}),
						!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: c.type
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: formatDuration(c.duration)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: outcomeTone(c.outcome),
								children: c.outcome
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { rating: callRating(c) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "max-w-[180px] truncate px-4 py-3 text-xs text-muted",
							title: c.notes || void 0,
							children: shortNotes(c.notes)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								onEdit: () => onEdit(c.id),
								onDelete: () => onDelete(c.id)
							})
						})
					]
				}, c.id);
			}) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3 p-4 md:hidden",
		children: calls.map((c) => {
			const a = agents[c.agentId];
			const cu = customers[c.customerId];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileCard, {
				title: contactBits(cu).line,
				subtitle: formatDate(c.datetime),
				rows: [
					["Phone", cu?.phone || "-"],
					["Agent", a?.name || "Unknown"],
					["Type", c.type || "Inbound"],
					["Duration", formatDuration(c.duration)],
					["Outcome", c.outcome],
					["QA", callRating(c) ? `${callRating(c)}/10` : "-"],
					["Notes", shortNotes(c.notes, 80)]
				],
				onEdit: () => onEdit(c.id),
				onDelete: () => onDelete(c.id)
			}, c.id);
		})
	})] });
}
var EMPTY = {
	agents: [],
	customers: [],
	clients: [],
	calls: [],
	messages: []
};
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZynloApp, { initial: EMPTY });
}
//#endregion
export { HomePage as component };
