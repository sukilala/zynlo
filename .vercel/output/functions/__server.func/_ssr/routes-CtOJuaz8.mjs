import { o as __toESM } from "../_runtime.mjs";
import { N as require_react, h as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as deleteCustomer, c as saveCall, i as deleteClient, l as saveClient, n as deleteAgent, o as getAllData, r as deleteCall, s as saveAgent, t as Route, u as saveCustomer } from "./routes-D1WGcV3p.mjs";
import { a as Trash2, c as Plus, d as Menu, f as LayoutDashboard, g as Building2, h as ChartColumn, i as TrendingUp, l as Phone, m as ClipboardList, n as Users, o as Star, p as Download, r as UserRound, s as Search, t as X, u as Pencil } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as BarChart, o as Line, r as LineChart, s as CartesianGrid, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CtOJuaz8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var OUTCOMES = [
	"Resolved",
	"Escalated",
	"Follow-up",
	"No Answer",
	"Voicemail"
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
function formatDate(d) {
	if (!d) return "—";
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
	if (!mins && mins !== 0) return "—";
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
function getAgentStats(data, agentId) {
	const agentCalls = data.calls.filter((c) => c.agentId === agentId);
	const total = agentCalls.length;
	const resolved = agentCalls.filter((c) => c.outcome === "Resolved").length;
	const rated = agentCalls.filter((c) => c.rating != null);
	const avgDuration = total ? agentCalls.reduce((s, c) => s + (c.duration || 0), 0) / total : 0;
	const csat = rated.length ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length : 0;
	return {
		total,
		resolved,
		resolutionRate: total ? resolved / total : 0,
		avgDuration,
		csat
	};
}
function getCustomerStats(data, customerId) {
	const custCalls = data.calls.filter((c) => c.customerId === customerId).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	return {
		total: custCalls.length,
		lastCall: custCalls[0],
		resolved: custCalls.filter((c) => c.outcome === "Resolved").length,
		escalated: custCalls.filter((c) => c.outcome === "Escalated").length,
		avgDuration: custCalls.length ? custCalls.reduce((s, c) => s + (c.duration || 0), 0) / custCalls.length : 0,
		qaScore: (() => {
			const rated = custCalls.filter((c) => c.rating != null);
			return rated.length ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length : 0;
		})(),
		lastContact: custCalls[0]?.datetime,
		callNotes: custCalls.filter((c) => c.notes).map((c) => c.notes).join(" | ")
	};
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
	if (!rating) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "tracking-wider text-primary",
		"aria-label": `${rating} of 5`,
		children: ["★".repeat(rating), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-purple-200",
			children: "★".repeat(5 - rating)
		})]
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
		id: "analytics",
		label: "Analytics",
		icon: TrendingUp
	},
	{
		id: "clients",
		label: "Clients",
		icon: Building2
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
	return "default";
};
function ZynloApp({ initial }) {
	const [data, setData] = (0, import_react.useState)(initial);
	const [section, setSection] = (0, import_react.useState)("dashboard");
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const [modal, setModal] = (0, import_react.useState)(null);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [toasts, setToasts] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [callSearch, setCallSearch] = (0, import_react.useState)("");
	const [callOutcome, setCallOutcome] = (0, import_react.useState)("");
	const [callAgent, setCallAgent] = (0, import_react.useState)("");
	const [customerSearch, setCustomerSearch] = (0, import_react.useState)("");
	const [clientSearch, setClientSearch] = (0, import_react.useState)("");
	const [clientSort, setClientSort] = (0, import_react.useState)("calls-desc");
	const [analyticsTab, setAnalyticsTab] = (0, import_react.useState)("performance");
	const [openClientCards, setOpenClientCards] = (0, import_react.useState)({});
	const [exportClientStep, setExportClientStep] = (0, import_react.useState)(false);
	const [exportClientName, setExportClientName] = (0, import_react.useState)("");
	const [callForm, setCallForm] = (0, import_react.useState)({
		datetime: localDatetimeValue(),
		agentId: "",
		customerId: "",
		clientId: "",
		type: "Inbound",
		duration: "3",
		outcome: "Resolved",
		rating: "",
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
		notes: ""
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
		setData(next);
		return next;
	}, []);
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => {
			getAllData().then(setData).catch(() => void 0);
		}, 8e3);
		return () => clearInterval(t);
	}, []);
	const agentsById = (0, import_react.useMemo)(() => agentMap(data), [data]);
	const customersById = (0, import_react.useMemo)(() => customerMap(data), [data]);
	const kpis = (0, import_react.useMemo)(() => {
		const today = todayStr();
		const yest = yesterdayStr();
		const todayCalls = data.calls.filter((c) => c.datetime?.startsWith(today));
		const yestCalls = data.calls.filter((c) => c.datetime?.startsWith(yest));
		const resolved = todayCalls.filter((c) => c.outcome === "Resolved").length;
		const resolution = todayCalls.length ? Math.round(resolved / todayCalls.length * 100) : 0;
		const aht = todayCalls.length ? todayCalls.reduce((s, c) => s + (c.duration || 0), 0) / todayCalls.length : 0;
		const rated = todayCalls.filter((c) => c.rating != null);
		const csat = rated.length ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length : 0;
		const delta = todayCalls.length - yestCalls.length;
		return {
			totalToday: todayCalls.length,
			delta,
			resolution,
			aht,
			csat
		};
	}, [data.calls]);
	const hourData = (0, import_react.useMemo)(() => {
		const hours = Array.from({ length: 24 }, (_, i) => ({
			hour: `${i}:00`,
			calls: 0
		}));
		for (const c of data.calls) {
			if (!c.datetime) continue;
			const h = new Date(c.datetime).getHours();
			if (!isNaN(h)) hours[h].calls += 1;
		}
		return hours;
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
				calls: data.calls.filter((c) => c.datetime?.startsWith(str)).length
			});
		}
		return days;
	}, [data.calls]);
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
			const score = stats.total ? Math.round(stats.resolutionRate * 40 + stats.csat * 20 + Math.min(stats.total, 50) - stats.avgDuration * 2) : 0;
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
			return a?.name.toLowerCase().includes(q) || cu?.name.toLowerCase().includes(q) || cu?.phone?.includes(q);
		});
		if (callOutcome) list = list.filter((c) => c.outcome === callOutcome);
		if (callAgent) list = list.filter((c) => c.agentId === callAgent);
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
	const filteredCustomers = (0, import_react.useMemo)(() => {
		const q = customerSearch.toLowerCase().trim();
		if (!q) return data.customers;
		return data.customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
	}, [data.customers, customerSearch]);
	const clientCards = (0, import_react.useMemo)(() => {
		const byName = {};
		for (const cl of data.clients) byName[cl.name] = {
			client: cl,
			name: cl.name,
			contacts: [],
			calls: []
		};
		for (const cu of data.customers) {
			const key = cu.company || cu.name;
			if (!byName[key]) byName[key] = {
				client: null,
				name: key,
				contacts: [],
				calls: []
			};
			byName[key].contacts.push(cu);
		}
		for (const call of data.calls) {
			const cl = call.clientId ? data.clients.find((c) => c.id === call.clientId) : null;
			const cu = customersById[call.customerId];
			const key = cl?.name || cu?.company || cu?.name || "Unknown";
			if (!byName[key]) byName[key] = {
				client: cl || null,
				name: key,
				contacts: [],
				calls: []
			};
			byName[key].calls.push(call);
		}
		let list = Object.values(byName);
		const q = clientSearch.toLowerCase().trim();
		if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || c.contacts.some((x) => x.name.toLowerCase().includes(q)));
		list.sort((a, b) => {
			if (clientSort === "calls-asc") return a.calls.length - b.calls.length;
			if (clientSort === "name-asc") return a.name.localeCompare(b.name);
			if (clientSort === "name-desc") return b.name.localeCompare(a.name);
			if (clientSort === "last-contact") {
				const la = a.calls[0]?.datetime || "";
				return (b.calls[0]?.datetime || "").localeCompare(la);
			}
			return b.calls.length - a.calls.length;
		});
		return list;
	}, [
		data,
		clientSearch,
		clientSort,
		customersById
	]);
	function openModal(kind, id) {
		setEditId(id || null);
		setExportClientStep(false);
		if (kind === "call") if (id) {
			const c = data.calls.find((x) => x.id === id);
			if (c) setCallForm({
				datetime: c.datetime.slice(0, 16),
				agentId: c.agentId,
				customerId: c.customerId,
				clientId: c.clientId || "",
				type: c.type,
				duration: String(c.duration),
				outcome: c.outcome,
				rating: c.rating != null ? String(c.rating) : "",
				notes: c.notes || ""
			});
		} else setCallForm({
			datetime: localDatetimeValue(),
			agentId: data.agents[0]?.id || "",
			customerId: data.customers[0]?.id || "",
			clientId: data.clients[0]?.id || "",
			type: "Inbound",
			duration: "3",
			outcome: "Resolved",
			rating: "",
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
				notes: c.notes
			});
		} else setCustomerForm({
			name: "",
			phone: "",
			email: "",
			company: "",
			notes: ""
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
			toast("Add an agent and customer first");
			return;
		}
		setBusy(true);
		try {
			await saveCall({ data: {
				id: editId || void 0,
				datetime: callForm.datetime,
				agentId: callForm.agentId,
				customerId: callForm.customerId,
				clientId: callForm.clientId || null,
				type: callForm.type,
				duration: parseFloat(callForm.duration) || 0,
				outcome: callForm.outcome,
				rating: callForm.rating ? parseInt(callForm.rating, 10) : null,
				notes: callForm.notes
			} });
			await refresh();
			setModal(null);
			toast(editId ? "Call updated" : "Call logged");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Failed to save call");
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
			await saveCustomer({ data: {
				id: editId || void 0,
				name: customerForm.name,
				phone: customerForm.phone,
				email: customerForm.email,
				company: customerForm.company,
				notes: customerForm.notes
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
	function askDelete(title, message, action) {
		setConfirm({
			title,
			message,
			onConfirm: async () => {
				setBusy(true);
				try {
					await action();
					await refresh();
					toast("Deleted");
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
	function exportCsv(type) {
		const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		if (type === "calls") downloadText("Datetime,Agent,Customer,Type,Duration,Outcome,Rating,Notes\n" + data.calls.map((c) => [
			c.datetime,
			agentsById[c.agentId]?.name || "",
			customersById[c.customerId]?.name || "",
			c.type,
			c.duration,
			c.outcome,
			c.rating ?? "",
			c.notes
		].map(escapeCsv).join(",")).join("\n"), `zynlo_calls_${date}.csv`, "text/csv");
		else if (type === "agents") downloadText("Name,Email,Role,Status,Total Calls,Resolution %,Avg Duration,QA Score\n" + data.agents.map((a) => {
			const s = getAgentStats(data, a.id);
			return [
				a.name,
				a.email,
				a.role,
				a.status,
				s.total,
				Math.round(s.resolutionRate * 100),
				s.avgDuration.toFixed(1),
				s.csat ? s.csat.toFixed(1) : ""
			].map(escapeCsv).join(",");
		}).join("\n"), `zynlo_agents_${date}.csv`, "text/csv");
		else if (type === "customers") downloadText("Name,Phone,Email,Company,Total Calls,Last Contact,Notes\n" + data.customers.map((c) => {
			const s = getCustomerStats(data, c.id);
			return [
				c.name,
				c.phone,
				c.email,
				c.company,
				s.total,
				s.lastCall ? formatDate(s.lastCall.datetime) : "",
				c.notes
			].map(escapeCsv).join(",");
		}).join("\n"), `zynlo_customers_${date}.csv`, "text/csv");
		else if (type === "json") downloadText(JSON.stringify(data, null, 2), `zynlo_backup_${date}.json`, "application/json");
		else if (type === "clients") {
			const header = "Company,Contact Name,Phone,Email,Total Calls,Resolved,Escalated,Avg Duration,QA Score,Last Contact,Notes\n";
			const rows = [];
			for (const card of clientCards) {
				if (exportClientName && card.name !== exportClientName) continue;
				const contacts = card.contacts.length > 0 ? card.contacts : [{
					id: "",
					name: "—",
					phone: "",
					email: "",
					company: card.name,
					notes: ""
				}];
				for (const contact of contacts) {
					const related = data.calls.filter((c) => c.customerId === contact.id || card.client && c.clientId === card.client.id);
					const resolved = related.filter((c) => c.outcome === "Resolved").length;
					const escalated = related.filter((c) => c.outcome === "Escalated").length;
					const avg = related.length ? related.reduce((s, c) => s + c.duration, 0) / related.length : 0;
					const rated = related.filter((c) => c.rating != null);
					const qa = rated.length ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length : 0;
					const last = related.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];
					rows.push([
						card.name,
						contact.name,
						contact.phone,
						contact.email,
						related.length,
						resolved,
						escalated,
						formatDuration(avg),
						qa ? qa.toFixed(1) : "",
						last ? formatDate(last.datetime) : "",
						contact.notes
					].map(escapeCsv).join(","));
				}
			}
			if (!rows.length) {
				toast("No client data to export");
				return;
			}
			downloadText(header + rows.join("\n"), `zynlo_clients_${exportClientName ? exportClientName.replace(/\\s+/g, "_") : "all"}_${date}.csv`, "text/csv");
		}
		toast("Export ready");
		setModal(null);
	}
	const go = (id) => {
		setSection(id);
		setSidebarOpen(false);
	};
	const recent = data.calls.slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()).slice(0, 10);
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-8 flex items-center px-2 pt-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo-wordmark.png",
						alt: "ZYNLO",
						className: "h-8 w-auto max-w-[180px] object-contain object-left md:h-9"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
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
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "min-w-0 flex-1 px-4 py-4 pt-16 md:ml-[260px] md:px-8 md:py-6 md:pt-6",
				children: [
					section === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Dashboard",
							onExport: () => openModal("export"),
							primaryLabel: "Log Call",
							onPrimary: () => openModal("call")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-5 w-5" }),
									label: "Total Calls Today",
									value: String(kpis.totalToday),
									sub: `${kpis.delta >= 0 ? "+" : ""}${kpis.delta} vs yesterday`
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
									value: formatDuration(kpis.aht),
									sub: "Target: under 5m"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-5 w-5" }),
									label: "Quality Assurance",
									value: kpis.csat ? kpis.csat.toFixed(1) : "0.0",
									sub: "/ 5.0",
									accent: true
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Calls by Hour" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-[260px] p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: hourData,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												strokeDasharray: "3 3",
												stroke: "rgba(167,67,255,0.08)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "hour",
												tick: { fontSize: 10 },
												interval: 3
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							title: "Recent Calls",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								variant: "secondary",
								size: "sm",
								onClick: () => go("calls"),
								children: "View All"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallsTable, {
							calls: recent,
							agents: agentsById,
							customers: customersById,
							onEdit: (id) => openModal("call", id),
							onDelete: (id) => askDelete("Delete Call?", "This call will be removed.", () => deleteCall({ data: { id } }).then(() => void 0)),
							compact: true
						})] })
					] }),
					section === "calls" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
							title: "Call Log",
							onExport: () => openModal("export"),
							primaryLabel: "Log Call",
							onPrimary: () => openModal("call")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Toolbar, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
								value: callSearch,
								onChange: setCallSearch,
								placeholder: "Search calls..."
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
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.calls.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-12 w-12" }),
							title: "No calls yet",
							description: "Log your first call to start tracking."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallsTable, {
							calls: filteredCalls,
							agents: agentsById,
							customers: customersById,
							onEdit: (id) => openModal("call", id),
							onDelete: (id) => askDelete("Delete Call?", "This call will be removed.", () => deleteCall({ data: { id } }).then(() => void 0))
						}) })
					] }),
					section === "agents" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionView, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
						title: "Agents",
						onExport: () => openModal("export"),
						primaryLabel: "Add Agent",
						onPrimary: () => openModal("agent")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.agents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-12 w-12" }),
						title: "No agents yet",
						description: "Add agents who handle customer calls."
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
										children: "Calls"
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
										children: "QA"
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
								const rate = s.total ? Math.round(s.resolutionRate * 100) : 0;
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
													children: a.email || "—"
												})] })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: a.role
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-semibold",
											children: s.total
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: formatDuration(s.avgDuration)
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
											children: s.csat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-primary",
												children: ["★ ", s.csat.toFixed(1)]
											}) : "—"
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
												onDelete: () => askDelete("Delete Agent?", "This agent and their calls will be removed.", () => deleteAgent({ data: { id: a.id } }).then(() => void 0))
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
							const rate = s.total ? Math.round(s.resolutionRate * 100) : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileCard, {
								title: a.name,
								subtitle: `${a.role} · ${a.status}`,
								rows: [
									["Calls", String(s.total)],
									["Avg Time", formatDuration(s.avgDuration)],
									["Resolution", `${rate}%`],
									["QA", s.csat ? s.csat.toFixed(1) : "—"]
								],
								onEdit: () => openModal("agent", a.id),
								onDelete: () => askDelete("Delete Agent?", "This agent and their calls will be removed.", () => deleteAgent({ data: { id: a.id } }).then(() => void 0))
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
							value: customerSearch,
							onChange: setCustomerSearch,
							placeholder: "Search customers..."
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: data.customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-12 w-12" }),
							title: "No customers yet",
							description: "Add customers to track interaction history."
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
											children: "Company"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3",
											children: "Calls"
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
										className: "border-t border-border hover:bg-purple-50/60",
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
												children: c.email || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: c.company || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-semibold",
												children: s.total
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: s.lastCall ? formatDate(s.lastCall.datetime) : "Never"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
													onEdit: () => openModal("customer", c.id),
													onDelete: () => askDelete("Delete Customer?", "This customer and their calls will be removed.", () => deleteCustomer({ data: { id: c.id } }).then(() => void 0))
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
										["Email", c.email || "—"],
										["Company", c.company || "—"],
										["Calls", String(s.total)],
										["Last", s.lastCall ? formatDate(s.lastCall.datetime) : "Never"]
									],
									onEdit: () => openModal("customer", c.id),
									onDelete: () => askDelete("Delete Customer?", "This customer and their calls will be removed.", () => deleteCustomer({ data: { id: c.id } }).then(() => void 0))
								}, c.id);
							})
						})] }) })
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { title: "Daily Call Volume (Last 7 Days)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
												stroke: "#a743ff",
												strokeWidth: 2,
												dot: { fill: "#a743ff" }
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
											children: r.csat ? r.csat.toFixed(1) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-bold",
											children: r.score
										})
									]
								}, r.agent.id)) })]
							})
						})] })
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[160px]",
							value: clientSort,
							onChange: (e) => setClientSort(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "calls-desc",
									children: "Most Calls"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "calls-asc",
									children: "Least Calls"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "name-asc",
									children: "Name A-Z"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "name-desc",
									children: "Name Z-A"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "last-contact",
									children: "Last Contact"
								})
							]
						})] }),
						clientCards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-12 w-12" }),
							title: "No clients yet",
							description: "Add clients to group contacts and track accounts."
						}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: clientCards.map((card) => {
								const open = openClientCards[card.name];
								const resolved = card.calls.filter((c) => c.outcome === "Resolved").length;
								const avg = card.calls.length ? card.calls.reduce((s, c) => s + c.duration, 0) / card.calls.length : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_8px_rgba(167,67,255,0.06)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex w-full items-center justify-between gap-3 bg-purple-50 px-5 py-4 text-left hover:bg-purple-100",
										onClick: () => setOpenClientCards((m) => ({
											...m,
											[card.name]: !m[card.name]
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2 text-lg font-bold",
											children: [card.name, card.client && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: card.client.status === "Active" ? "strong" : "soft",
												children: card.client.status
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1 text-xs text-muted",
											children: [
												card.contacts.length,
												" contacts ·",
												" ",
												card.calls.length,
												" calls",
												card.client?.industry ? ` · ${card.client.industry}` : ""
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [card.client && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
												size: "sm",
												variant: "secondary",
												onClick: (e) => {
													e.stopPropagation();
													openModal("client", card.client.id);
												},
												children: "Edit"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("text-primary transition-transform", open && "rotate-180"),
												children: "▾"
											})]
										})]
									}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4 px-5 py-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniKpi, {
														label: "Calls",
														value: String(card.calls.length)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniKpi, {
														label: "Resolved",
														value: String(resolved)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniKpi, {
														label: "Avg Duration",
														value: formatDuration(avg)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniKpi, {
														label: "Contacts",
														value: String(card.contacts.length)
													})
												]
											}),
											card.contacts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted",
												children: "Contacts"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "space-y-2",
												children: card.contacts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2 text-sm",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: c.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted",
														children: c.phone
													})]
												}, c.id))
											})] }),
											card.client && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex justify-end",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
													variant: "danger",
													size: "sm",
													onClick: () => askDelete("Delete Client?", "This client record will be removed.", () => deleteClient({ data: { id: card.client.id } }).then(() => void 0)),
													children: "Delete Client"
												})
											})
										]
									})]
								}, card.name);
							})
						})
					] })
				]
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
							children: "Add at least one agent and one customer before logging a call."
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
										onChange: (e) => setCallForm((f) => ({
											...f,
											customerId: e.target.value
										})),
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
											outcome: e.target.value
										})),
										children: OUTCOMES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: o }, o))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "QA Rating (1–5)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 1,
										max: 5,
										step: 1,
										className: inputClass,
										value: callForm.rating,
										onChange: (e) => setCallForm((f) => ({
											...f,
											rating: e.target.value
										}))
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
								placeholder: "Call summary, action items…"
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
							label: "Company",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								value: customerForm.company,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									company: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: inputClass + " min-h-[70px]",
								value: customerForm.notes,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									notes: e.target.value
								}))
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
								}))
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: modal === "export",
				onClose: () => setModal(null),
				title: "Export Data",
				children: !exportClientStep ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3",
					children: [
						[
							"calls",
							"Calls (CSV)",
							"All call records"
						],
						[
							"agents",
							"Agents (CSV)",
							"Agents with performance stats"
						],
						[
							"customers",
							"Customers (CSV)",
							"Customers with call counts"
						],
						[
							"clients-step",
							"Clients by Company (CSV)",
							"Select a client or all"
						],
						[
							"json",
							"Full Backup (JSON)",
							"Everything as JSON"
						]
					].map(([key, title, desc]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex items-start gap-3 rounded-xl border-2 border-border p-4 text-left transition hover:border-primary hover:bg-bg",
						onClick: () => {
							if (key === "clients-step") setExportClientStep(true);
							else exportCsv(key);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mt-0.5 h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-bold",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: desc
						})] })]
					}, key))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Client",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputClass,
							value: exportClientName,
							onChange: (e) => setExportClientName(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Clients"
							}), clientCards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: c.name,
								children: [
									c.name,
									" (",
									c.calls.length,
									" calls)"
								]
							}, c.name))]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "secondary",
							onClick: () => setExportClientStep(false),
							children: "Back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => exportCsv("clients"),
							children: "Export CSV"
						})]
					})]
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
function Header({ title, onExport, primaryLabel, onPrimary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold tracking-tight md:text-[28px]",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-wrap gap-2 sm:w-auto",
			children: [onExport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "secondary",
				className: "flex-1 sm:flex-none",
				onClick: onExport,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export"]
			}), primaryLabel && onPrimary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				className: "flex-1 sm:flex-none",
				onClick: onPrimary,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					" ",
					primaryLabel
				]
			})]
		})]
	});
}
function Kpi({ icon, label, value, sub, bar, accent }) {
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
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-wide text-muted",
						children: l
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
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
function MiniKpi({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg p-3 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-semibold uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xl font-bold",
			children: value
		})]
	});
}
function CallsTable({ calls, agents, customers, onEdit, onDelete, compact }) {
	if (!calls.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-6 py-10 text-center text-sm text-muted",
		children: "No matching calls"
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
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: cu?.name || "Unknown"
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { rating: c.rating })
						}),
						!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "max-w-[180px] truncate px-4 py-3 text-xs text-muted",
							children: c.notes || "—"
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
				title: cu?.name || "Unknown",
				subtitle: formatDate(c.datetime),
				rows: [
					["Agent", a?.name || "Unknown"],
					["Duration", formatDuration(c.duration)],
					["Outcome", c.outcome],
					["QA", c.rating ? `${c.rating}/5` : "—"]
				],
				onEdit: () => onEdit(c.id),
				onDelete: () => onDelete(c.id)
			}, c.id);
		})
	})] });
}
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZynloApp, { initial: Route.useLoaderData() });
}
//#endregion
export { HomePage as component };
