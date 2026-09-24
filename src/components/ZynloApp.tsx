// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Download,
  FileText,
  FileUp,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  deleteAgent as deleteAgentRemote,
  deleteCall as deleteCallRemote,
  deleteClient as deleteClientRemote,
  deleteCustomer as deleteCustomerRemote,
  deleteMessage as deleteMessageRemote,
  getAllData,
  mergeCustomers as mergeCustomersRemote,
  saveAgent as saveAgentRemote,
  saveCall as saveCallRemote,
  saveClient as saveClientRemote,
  saveCustomer as saveCustomerRemote,
  saveMessage as saveMessageRemote,
} from "@/lib/zynlo/api";
import type { ZynloData } from "@/lib/zynlo/types";
import {
  AGENT_ROLES,
  AGENT_STATUSES,
  CALL_TYPES,
  CLIENT_STATUSES,
  MESSAGE_CHANNELS,
  MESSAGE_DIRECTIONS,
  MESSAGE_STATUSES,
  OUTCOMES,
} from "@/lib/zynlo/types";
import {
  agentMap,
  callRating,
  clientMap,
  countsAsInbound,
  countsAsOutbound,
  countsInCallLog,
  customerCompanyLabel,
  customerMap,
  customerTimeline,
  dateOffsetStr,
  downloadText,
  escapeCsv,
  filterSinceDatetime,
  findCustomerByPhone,
  formatDate,
  formatDuration,
  getAgentStats,
  getClientStats,
  customersSharingPhone,
  getCustomerStats,
  getEscalationItems,
  getFollowUpItems,
  getUnratedRecent,
  localDatetimeValue,
  periodQa,
  qaEligible,
  qaScore,
  formatQa,
  resolutionOf,
  shortNotes,
  summarizeEscalations,
  todayStr,
  yesterdayStr,
} from "@/lib/zynlo/utils";
import { downloadClientPdf } from "@/lib/zynlo/pdf-report";
import {
  clearAgentSession,
  hashAgentPassword,
  readAgentSession,
  writeAgentSession,
} from "@/lib/zynlo/session";
import {
  buildReconcilePreviewFromRows,
  crmOutcomeForRow,
  matchAgentId,
  matchExistingCall,
  parseTelecomFile,
} from "@/lib/zynlo/reconcile-pdf";
import {
  Avatar,
  Badge,
  Btn,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Modal,
  Stars,
  ToastStack,
  inputClass,
} from "./ui-bits";
import { cn } from "@/lib/cn";

const LAST_AGENT_KEY = "zynlo.lastAgentId";
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
function upsertById(list, item, byTime) {
	if (!item || !item.id) return list;
	const next = list.filter((x) => x.id !== item.id).concat(item);
	if (byTime) next.sort((a, b) => String(b.datetime || "").localeCompare(String(a.datetime || "")));
	return next;
}
async function runPool(items, limit, fn) {
	if (!items.length) return;
	let i = 0;
	const n = Math.min(limit, items.length);
	await Promise.all(Array.from({ length: n }, async () => {
		while (i < items.length) {
			const idx = i++;
			await fn(items[idx], idx);
		}
	}));
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
const NAV = [
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
const CHART_COLORS = [
	"#c77dff",
	"#a743ff",
	"#e0c4ff",
	"#8a2be2",
	"#d4b8f5",
	"#6b4a94"
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
export function ZynloApp({ initial }: { initial: ZynloData }) {
	const [data, setData] = useState({
		...initial,
		messages: initial.messages || []
	});
	const [section, setSection] = useState("dashboard");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [modal, setModal] = useState(null);
	const [editId, setEditId] = useState(null);
	const [confirm, setConfirm] = useState(null);
	const [toasts, setToasts] = useState([]);
	const [busy, setBusy] = useState(false);
	const [listLimit, setListLimit] = useState(40);
	const [callSearch, setCallSearch] = useState("");
	const [callDateFrom, setCallDateFrom] = useState("");
	const [callDateTo, setCallDateTo] = useState("");
	const [callOutcome, setCallOutcome] = useState("");
	const [callAgent, setCallAgent] = useState("");
	const [callType, setCallType] = useState("");
	const [msgSearch, setMsgSearch] = useState("");
	const [msgChannel, setMsgChannel] = useState("");
	const [msgStatus, setMsgStatus] = useState("");
	const [customerSearch, setCustomerSearch] = useState("");
	const [clientSearch, setClientSearch] = useState("");
	const [analyticsTab, setAnalyticsTab] = useState("performance");
	const [exportClientStep, setExportClientStep] = useState(false);
	const [exportClientName, setExportClientName] = useState("");
	const [selectedClientId, setSelectedClientId] = useState(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState(null);
	const [meAgentId, setMeAgentId] = useState("");
	const [session, setSession] = useState(readAgentSession);
	const [loginAgentId, setLoginAgentId] = useState(readLastAgentId);
	const [loginPassword, setLoginPassword] = useState("");
	const [loginErr, setLoginErr] = useState("");
	const [queueScope, setQueueScope] = useState("mine");
	const [nameOverwrite, setNameOverwrite] = useState("keep");
	const [quickForm, setQuickForm] = useState({
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
	const [callForm, setCallForm] = useState({
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
	const [msgForm, setMsgForm] = useState({
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
	const [agentForm, setAgentForm] = useState({
		name: "",
		email: "",
		role: "Agent",
		status: "Active",
		password: ""
	});
	const [customerForm, setCustomerForm] = useState({
		name: "",
		phone: "",
		email: "",
		company: "",
		clientId: ""
	});
	const [clientForm, setClientForm] = useState({
		name: "",
		industry: "",
		phone: "",
		email: "",
		website: "",
		status: "Active",
		address: "",
		notes: ""
	});
	const [reconcilePreview, setReconcilePreview] = useState(null);
	const toast = useCallback((message, type = "info") => {
		const id = Math.random().toString(36).slice(2);
		setToasts((t) => [...t, {
			id,
			message,
			type
		}]);
		setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
	}, []);
	const refresh = useCallback(async () => {
		const next = await getAllData();
		const mapped = {
			...next,
			messages: next.messages || []
		};
		setData(mapped);
		return mapped;
	}, []);
	const saveCall = async (args) => {
		const saved = await saveCallRemote(args);
		if (saved && saved.id) setData((d) => ({
			...d,
			calls: upsertById(d.calls, saved, true)
		}));
		return saved;
	};
	const saveMessage = async (args) => {
		const saved = await saveMessageRemote(args);
		if (saved && saved.id) setData((d) => ({
			...d,
			messages: upsertById(d.messages || [], saved, true)
		}));
		return saved;
	};
	const saveCustomer = async (args) => {
		const saved = await saveCustomerRemote(args);
		if (saved && saved.id) setData((d) => ({
			...d,
			customers: upsertById(d.customers, saved, false)
		}));
		return saved;
	};
	const saveClient = async (args) => {
		const saved = await saveClientRemote(args);
		if (saved && saved.id) setData((d) => ({
			...d,
			clients: upsertById(d.clients, saved, false)
		}));
		return saved;
	};
	const saveAgent = async (args) => {
		const saved = await saveAgentRemote(args);
		if (saved && saved.id) setData((d) => ({
			...d,
			agents: upsertById(d.agents, saved, false)
		}));
		return saved;
	};
	const deleteCall = async (args) => {
		const id = args?.data?.id;
		await deleteCallRemote(args);
		if (id) setData((d) => ({
			...d,
			calls: d.calls.filter((c) => c.id !== id)
		}));
	};
	const deleteMessage = async (args) => {
		const id = args?.data?.id;
		await deleteMessageRemote(args);
		if (id) setData((d) => ({
			...d,
			messages: (d.messages || []).filter((c) => c.id !== id)
		}));
	};
	const deleteCustomer = async (args) => {
		const id = args?.data?.id;
		await deleteCustomerRemote(args);
		if (id) setData((d) => ({
			...d,
			customers: d.customers.filter((c) => c.id !== id)
		}));
	};
	const deleteClient = async (args) => {
		const id = args?.data?.id;
		await deleteClientRemote(args);
		if (id) setData((d) => ({
			...d,
			clients: d.clients.filter((c) => c.id !== id)
		}));
	};
	const deleteAgent = async (args) => {
		const id = args?.data?.id;
		await deleteAgentRemote(args);
		if (id) setData((d) => ({
			...d,
			agents: d.agents.filter((c) => c.id !== id)
		}));
	};
	const mergeCustomers = async (args) => mergeCustomersRemote(args);
	useEffect(() => {
		const saved = session?.agentId || readLastAgentId();
		const pool = data.agents;
		if (saved && pool.some((a) => a.id === saved)) setMeAgentId(saved);
		else if (pool[0]?.id) setMeAgentId(pool[0].id);
	}, [data.agents, session]);
	useEffect(() => {
		if (!session || data.agents.length === 0) return;
		const agent = data.agents.find((a) => a.id === session.agentId);
		if (!agent || !agent.passwordHash || agent.passwordHash !== session.proof) {
			clearAgentSession();
			setSession(null);
		}
	}, [data.agents, session]);
	useEffect(() => {
		refresh().catch((err) => {
			toast(err instanceof Error ? err.message : "Could not load data");
		});
	}, [refresh, toast]);
	useEffect(() => {
		setListLimit(40);
	}, [section, callSearch, callDateFrom, callDateTo, callOutcome, callAgent, callType, msgSearch, msgChannel, msgStatus, customerSearch, clientSearch]);
	function pickAgent() {
		if (meAgentId && data.agents.some((a) => a.id === meAgentId)) return meAgentId;
		return data.agents[0]?.id || "";
	}
	function setWorkingAgent(id) {
		setMeAgentId(id);
		writeLastAgentId(id);
	}
	async function onLogin(e) {
		e.preventDefault();
		const agent = data.agents.find((a) => a.id === loginAgentId);
		if (!agent) {
			setLoginErr("Select your name");
			return;
		}
		if (!loginPassword.trim()) {
			setLoginErr("Enter your password");
			return;
		}
		setBusy(true);
		setLoginErr("");
		try {
			const proof = await hashAgentPassword(agent.id, loginPassword);
			if (!agent.passwordHash || proof !== agent.passwordHash) {
				setLoginErr("Wrong password");
				return;
			}
			writeAgentSession(agent.id, proof);
			setSession({
				agentId: agent.id,
				proof
			});
			setWorkingAgent(agent.id);
			setLoginPassword("");
		} finally {
			setBusy(false);
		}
	}
	function onSignOut() {
		clearAgentSession();
		setSession(null);
		setLoginAgentId(meAgentId || readLastAgentId());
		setLoginPassword("");
		setLoginErr("");
	}
	async function onReconcileFiles(files) {
		const list = files.slice(0, 10);
		if (list.length === 0) return;
		setBusy(true);
		try {
			const allRows = [];
			const names = [];
			const dirs = /* @__PURE__ */ new Set();
			let named = 0;
			let queueAnswered = false;
			const parsedList = await Promise.all(list.map((file) => parseTelecomFile(file, data.agents)));
			parsedList.forEach((parsed, i) => {
				if (parsed.queueAnswered) queueAnswered = true;
				if (parsed.fileDirection === "Inbound" || parsed.fileDirection === "Outbound") {
					dirs.add(parsed.fileDirection);
					named += 1;
				}
				names.push(list[i].name);
				for (const r of parsed.rows) allRows.push(r);
			});
			const fileDirection = named === list.length && dirs.size === 1 ? [...dirs][0] : null;
			const preview = buildReconcilePreviewFromRows(names.length === 1 ? names[0] : `${names.length} files`, allRows, data, data.agents, fileDirection, queueAnswered);
			setReconcilePreview(preview);
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
		const extraIds = reconcilePreview.extraIds || [];
		if (reconcilePreview.missing.length === 0 && fixes.length === 0 && extraIds.length === 0) {
			toast("Nothing to apply");
			return;
		}
		setBusy(true);
		try {
			const live = await getAllData();
			let flipped = 0;
			await runPool(fixes, 6, async (fix) => {
				const c = live.calls.find((x) => x.id === fix.callId);
				if (!c) return;
				const nextDur = fix.toDuration > 0 ? fix.toDuration : c.duration;
				if (Math.abs((Number(c.duration) || 0) - nextDur) < 0.05) return;
				await saveCall({ data: {
					id: c.id,
					datetime: c.datetime,
					agentId: c.agentId,
					customerId: c.customerId,
					clientId: c.clientId,
					type: c.type,
					duration: nextDur,
					outcome: c.outcome,
					rating: c.rating,
					ratingScale: c.ratingScale,
					notes: c.notes,
					followUpAt: c.followUpAt,
					source: c.source === "telecom" ? "telecom" : "manual",
					csvCounted: c.csvCounted
				} });
				flipped += 1;
			});
			let customers = (live.customers || []).slice();
			const liveData = {
				...live,
				customers,
				messages: live.messages || []
			};
			const used = new Set([
				...fixes.map((f) => f.callId),
				...(reconcilePreview.matchedIds || [])
			]);
			const toAdd = [];
			for (const row of reconcilePreview.missing) {
				const hit = matchExistingCall(row, liveData, true, void 0, used);
				if (hit && !used.has(hit.id)) {
					used.add(hit.id);
					continue;
				}
				toAdd.push(row);
			}
			const ccId =
				live.clients.find((c) => /cc\s*express/i.test(c.name || ""))?.id ||
				live.clients[0]?.id ||
				null;
			for (const row of toAdd) {
				let customer = findCustomerByPhone(customers, row.phone) || null;
				if (!customer) {
					customer = await saveCustomer({ data: {
						name: row.phone,
						phone: row.phone,
						email: "",
						company: "",
						clientId: ccId,
						notes: ""
					} });
					customers = [...customers, customer];
					liveData.customers = customers;
				}
				row._customer = customer;
			}
			let added = 0;
			await runPool(toAdd, 6, async (row) => {
				const customer = row._customer;
				const saved = await saveCall({ data: {
					datetime: row.datetime,
					agentId: row.agentId || matchAgentId(row.agentHint, live.agents) || "",
					customerId: customer.id,
					clientId: customer.clientId || ccId,
					type: row.type,
					duration: row.durationMin,
					outcome: crmOutcomeForRow(row),
					rating: null,
					notes: row.did ? `Telecom reconcile. ${row.disposition}. DID ${row.did}.` : `Telecom reconcile. ${row.disposition}.`,
					followUpAt: null,
					source: "telecom",
					csvCounted: true
				} });
				if (saved && saved.id) {
					liveData.calls = [...liveData.calls, saved];
					used.add(saved.id);
				}
				added += 1;
			});
			let hidden = 0;
			const keep = new Set(used);
			const outDays = new Set([...reconcilePreview.already, ...reconcilePreview.missing].filter((r) => r.type === "Outbound").map((r) => (r.datetime || "").slice(0, 10)).filter(Boolean));
			const inDays = new Set([...reconcilePreview.already, ...reconcilePreview.missing].filter((r) => r.type === "Inbound").map((r) => (r.datetime || "").slice(0, 10)).filter(Boolean));
			const recomputed = [];
			for (const c of liveData.calls) {
				if (c.csvCounted === false) continue;
				if (keep.has(c.id)) continue;
				if (c.outcome === "No Answer" || c.outcome === "Voicemail") continue;
				const day = (c.datetime || "").slice(0, 10);
				if (c.type === "Outbound" && outDays.has(day)) recomputed.push(c.id);
				if (c.type === "Inbound" && inDays.has(day)) recomputed.push(c.id);
			}
			const hideIds = [...new Set([...extraIds, ...recomputed])];
			const stamp = [...new Set([...(reconcilePreview.matchedIds || []), ...hideIds])];
			await runPool(stamp, 6, async (id) => {
				const c = liveData.calls.find((x) => x.id === id) || live.calls.find((x) => x.id === id);
				if (!c) return;
				const hide = hideIds.includes(id);
				if (!hide && c.csvCounted === true) return;
				if (hide && c.csvCounted === false) return;
				await saveCall({ data: {
					id: c.id,
					datetime: c.datetime,
					agentId: c.agentId,
					customerId: c.customerId,
					clientId: c.clientId,
					type: c.type,
					duration: c.duration,
					outcome: c.outcome,
					rating: c.rating,
					ratingScale: c.ratingScale,
					notes: c.notes,
					followUpAt: c.followUpAt,
					source: c.source === "telecom" ? "telecom" : "manual",
					csvCounted: hide ? false : true
				} });
				if (hide) hidden += 1;
			});
			void refresh();
			setReconcilePreview(null);
			setModal(null);
			const bits = [];
			if (added) bits.push(`${added} added`);
			if (flipped) bits.push(`${flipped} updated`);
			if (hidden) bits.push(`${hidden} extra hidden`);
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
				followUpAt: patch.followUpAt !== void 0 ? patch.followUpAt : c.followUpAt,
				source: c.source === "telecom" ? "telecom" : "manual",
				csvCounted: c.csvCounted
			} });
			void refresh();
			toast("Updated");
		} catch (err) {
			toast(err instanceof Error ? err.message : "Update failed");
		} finally {
			setBusy(false);
		}
	}
	useEffect(() => {
		const tick = () => {
			if (typeof document !== "undefined" && document.hidden) return;
			refresh().catch(() => undefined);
		};
		const t = setInterval(tick, 120000);
		const onVis = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			clearInterval(t);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [refresh]);
	useEffect(() => {
		if (section === "escalations") setSection("dashboard");
	}, [section]);
	const agentsById = useMemo(() => agentMap(data), [data]);
	const customersById = useMemo(() => customerMap(data), [data]);
	const clientsById = useMemo(() => clientMap(data), [data]);
	const messages = data.messages || [];
	const unratedRecent = useMemo(() => getUnratedRecent(data, 2), [data]);
	const unratedList = useMemo(() => {
		return queueScope === "mine" && meAgentId ? unratedRecent.filter((c) => c.agentId === meAgentId) : unratedRecent;
	}, [
		unratedRecent,
		queueScope,
		meAgentId
	]);
	const escalationItems = useMemo(() => getEscalationItems(data), [data.calls]);
	const escalationStats = useMemo(() => summarizeEscalations(escalationItems), [escalationItems]);
	const kpis = useMemo(() => {
		const today = todayStr();
		const yest = yesterdayStr();
		const todayCalls = data.calls.filter((c) => countsInCallLog(c) && c.datetime?.startsWith(today));
		const yestCalls = data.calls.filter((c) => countsInCallLog(c) && c.datetime?.startsWith(yest));
		const todayMsgs = messages.filter((m) => m.datetime?.startsWith(today));
		const resolution = resolutionOf(todayCalls).percent;
		const timed = todayCalls.filter((c) => (c.duration || 0) > 0);
		const aht = timed.length ? timed.reduce((s, c) => s + (c.duration || 0), 0) / timed.length : 0;
		const allRated = data.calls.filter(qaEligible).map(callRating).filter((n) => n != null);
		const allCsat = allRated.length ? allRated.reduce((s, n) => s + n, 0) / allRated.length : 0;
		const period = periodQa(data.calls, 14);
		const csat = period.avg;
		const todayRatedScores = todayCalls.filter(qaEligible).map(callRating).filter((n) => n != null);
		const todayCsat = todayRatedScores.length ? todayRatedScores.reduce((s, n) => s + n, 0) / todayRatedScores.length : 0;
		const delta = todayCalls.length - yestCalls.length;
		const inboundToday = todayCalls.filter(countsAsInbound).length;
		const outboundToday = todayCalls.filter(countsAsOutbound).length;
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
			ratedCount: allRated.length,
			periodCsat: period.avg,
			periodRated: period.rated,
			periodCalls: period.count,
			allCsat,
			allRated: allRated.length,
			todayCsat,
			todayRatedCount: todayRatedScores.length,
			escOpen: escalationStats.open,
			escOverdue: escalationStats.overdue,
			escDueToday: escalationStats.dueToday
		};
	}, [data.calls, messages, escalationStats]);
	const callsByDay = useMemo(() => {
		const days = [];
		for (let i = 13; i >= 0; i--) {
			const str = dateOffsetStr(-i);
			const d = new Date(str + "T12:00:00");
			days.push({
				label: d.toLocaleDateString("en-GB", {
					weekday: "short",
					day: "numeric"
				}),
				calls: data.calls.filter((c) => countsInCallLog(c) && c.datetime?.startsWith(str)).length
			});
		}
		return days;
	}, [data.calls]);
	const outcomeData = useMemo(() => {
		const map = {};
		for (const c of data.calls) {
			if (!countsInCallLog(c) || !c.outcome) continue;
			map[c.outcome] = (map[c.outcome] || 0) + 1;
		}
		const entries = Object.entries(map).map(([name, value]) => ({
			name,
			value
		}));
		return entries.length ? entries : [{
			name: "No Data",
			value: 0
		}];
	}, [data.calls]);
	const dailyVolume = useMemo(() => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const str = dateOffsetStr(-i);
			const d = new Date(str + "T12:00:00");
			days.push({
				label: d.toLocaleDateString("en-GB", {
					weekday: "short",
					day: "numeric"
				}),
				calls: data.calls.filter((c) => countsInCallLog(c) && c.datetime?.startsWith(str)).length,
				messages: messages.filter((m) => m.datetime?.startsWith(str)).length
			});
		}
		return days;
	}, [data.calls, messages]);
	const ahtTrend = useMemo(() => {
		const days = [];
		for (let i = 13; i >= 0; i--) {
			const str = dateOffsetStr(-i);
			const d = new Date(str + "T12:00:00");
			const dayCalls = data.calls.filter((c) => countsInCallLog(c) && c.datetime?.startsWith(str) && (c.duration || 0) > 0);
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
	const agentRankings = useMemo(() => {
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
	const filteredCalls = useMemo(() => {
		let list = data.calls.filter(countsInCallLog);
		const q = callSearch.toLowerCase().trim();
		if (q) list = list.filter((c) => {
			const a = agentsById[c.agentId];
			const cu = customersById[c.customerId];
			const when = (c.datetime || "").slice(0, 10);
			const shown = formatDate(c.datetime).toLowerCase();
			return a?.name.toLowerCase().includes(q) || cu?.name.toLowerCase().includes(q) || cu?.phone?.includes(q) || (c.notes || "").toLowerCase().includes(q) || when.includes(q) || shown.includes(q);
		});
		if (callDateFrom) list = list.filter((c) => (c.datetime || "").slice(0, 10) >= callDateFrom);
		if (callDateTo) list = list.filter((c) => (c.datetime || "").slice(0, 10) <= callDateTo);
		if (callOutcome) list = list.filter((c) => c.outcome === callOutcome);
		if (callAgent) list = list.filter((c) => c.agentId === callAgent);
		if (callType) list = list.filter((c) => (c.type || "Inbound") === callType);
		list.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
		return list;
	}, [
		data.calls,
		callSearch,
		callDateFrom,
		callDateTo,
		callOutcome,
		callAgent,
		callType,
		agentsById,
		customersById
	]);
	const filteredMessages = useMemo(() => {
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
	const filteredCustomers = useMemo(() => {
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
	const filteredClients = useMemo(() => {
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
				status: a.status,
				password: ""
			});
		} else setAgentForm({
			name: "",
			email: "",
			role: "Agent",
			status: "Active",
			password: ""
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
				followUpAt: callForm.outcome === "Follow-up" || callForm.outcome === "Escalated" ? callForm.followUpAt || dateOffsetStr(1) : null,
				source: editId && data.calls.find((c) => c.id === editId)?.source === "telecom" ? "telecom" : "manual",
				csvCounted: editId ? data.calls.find((c) => c.id === editId)?.csvCounted : void 0
			} });
			setWorkingAgent(callForm.agentId);
			void refresh();
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
				direction: quickForm.type === "Outbound" ? "Outbound" : "Inbound",
				subject: "",
				body: notes,
				status: "Closed",
				notes: ""
			} });
			setWorkingAgent(quickForm.agentId);
			void refresh();
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
			void refresh();
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
		if (!editId && !agentForm.password.trim()) {
			toast("Set a password for this agent");
			return;
		}
		setBusy(true);
		try {
			const id = editId || Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
			const passwordHash = agentForm.password.trim() ? await hashAgentPassword(id, agentForm.password) : void 0;
			await saveAgent({ data: {
				id,
				name: agentForm.name,
				email: agentForm.email,
				role: agentForm.role,
				status: agentForm.status,
				passwordHash
			} });
			void refresh();
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
			void refresh();
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
			void refresh();
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
					void refresh();
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
		if (type === "calls") downloadText("Datetime,Agent,Customer,Phone,Type,Duration,Outcome,Rating,Notes\n" + data.calls.filter(countsInCallLog).map((c) => [
			c.datetime,
			agentsById[c.agentId]?.name || "",
			customersById[c.customerId]?.name || "",
			customersById[c.customerId]?.phone || "",
			c.type,
			c.duration,
			c.outcome,
			qaScore(c) ?? "",
			c.notes
		].map(escapeCsv).join(",")).join("\n"), `zynlo_calls_${date}.csv`, "text/csv");
		else if (type === "escalations") downloadText("Logged,Due,Age days,Status,Agent,Customer,Phone,Type,Notes\n" + getEscalationItems(data).map((e) => {
			const who = contactBits(customersById[e.customerId]);
			return [
				e.datetime,
				e.due || "",
				e.ageDays,
				e.bucket,
				agentsById[e.agentId]?.name || "",
				who.name,
				who.phone,
				e.type,
				e.notes
			].map(escapeCsv).join(",");
		}).join("\n"), `zynlo_escalations_${date}.csv`, "text/csv");
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
				s.csat ? formatQa(s.csat) : ""
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
				s.avgQa ? formatQa(s.avgQa) : "",
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
					periodCalls.filter(countsAsInbound).length,
					periodCalls.filter(countsAsOutbound).length,
					getFollowUpItems({
						...data,
						calls: periodCalls,
						messages: periodMsgs
					}).length,
					s.avgDuration.toFixed(1),
					periodQaPack.avg ? formatQa(periodQaPack.avg) : ""
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
					qaScore(call) ?? "",
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
		} else if (type === "json") {
			const safe = {
				...data,
				agents: data.agents.map((a) => {
					const { passwordHash, ...rest } = a;
					return rest;
				})
			};
			downloadText(JSON.stringify(safe, null, 2), `zynlo_backup_${date}.json`, "application/json");
		}
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
		setSection(id === "escalations" ? "dashboard" : id);
		setSidebarOpen(false);
		if (id !== "customers") setSelectedCustomerId(null);
	};
	const todayKey = todayStr();
	const todayCallsSorted = data.calls.filter((c) => countsInCallLog(c) && c.datetime?.startsWith(todayKey)).slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
	todayCallsSorted.filter((c) => (c.type || "Inbound") === "Inbound");
	todayCallsSorted.filter((c) => c.type === "Outbound");
	todayCallsSorted.filter((c) => c.type === "Callback");
	todayCallsSorted.slice(0, 8);
	const recentMsgs = messages.slice().sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()).slice(0, 5);
	const authedAgent = data.agents.find((a) => a.id === session?.agentId && a.passwordHash && a.passwordHash === session.proof);
	const sessionPending = !!session && data.agents.length === 0;
	if (!sessionPending && !authedAgent) {
		return /* @__PURE__ */ jsxs("div", {
			className: "flex min-h-screen items-center justify-center bg-bg px-4 text-fg",
			children: [
				/* @__PURE__ */ jsxs("form", {
					onSubmit: onLogin,
					className: "w-full max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-[0_12px_40px_rgba(45,27,78,0.18)]",
					children: [
						/* @__PURE__ */ jsx("img", {
							src: "/logo-wordmark.png",
							alt: "ZYNLO",
							className: "mx-auto h-9 w-auto object-contain"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-center text-sm text-muted",
							children: "Sign in to the workspace"
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Agent",
							children: /* @__PURE__ */ jsxs("select", {
								required: true,
								className: inputClass,
								value: loginAgentId,
								onChange: (e) => {
									setLoginAgentId(e.target.value);
									setLoginErr("");
								},
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: data.agents.length ? "Select your name" : "Loading…"
								}), data.agents.map((a) => /* @__PURE__ */ jsx("option", {
									value: a.id,
									children: a.name
								}, a.id))]
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Password",
							children: /* @__PURE__ */ jsx("input", {
								type: "password",
								required: true,
								autoComplete: "current-password",
								className: inputClass,
								value: loginPassword,
								onChange: (e) => {
									setLoginPassword(e.target.value);
									setLoginErr("");
								}
							})
						}),
						loginErr ? /* @__PURE__ */ jsx("p", {
							className: "text-sm font-semibold text-red-400",
							children: loginErr
						}) : null,
						/* @__PURE__ */ jsx(Btn, {
							type: "submit",
							disabled: busy || !data.agents.length,
							className: "w-full",
							children: busy ? "Checking…" : "Enter"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-center text-[11px] text-muted",
							children: "This browser stays signed in."
						})
					]
				}),
				/* @__PURE__ */ jsx(ToastStack, {
					toasts,
					onDismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id))
				})
			]
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "fixed left-4 top-4 z-[200] flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.3)] md:hidden",
				onClick: () => setSidebarOpen((o) => !o),
				"aria-label": "Menu",
				children: sidebarOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
			}),
			sidebarOpen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-[90] bg-black/40 md:hidden",
				onClick: () => setSidebarOpen(false)
			}),
			/* @__PURE__ */ jsxs("aside", {
				className: cn("fixed z-[100] flex h-full w-[260px] flex-col overflow-y-auto bg-gradient-to-b from-sidebar to-sidebar-2 px-4 py-6 transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "mb-8 flex items-center px-2 pt-1",
						children: /* @__PURE__ */ jsx("img", {
							src: "/logo-wordmark.png",
							alt: "ZYNLO",
							className: "h-8 w-auto max-w-[180px] object-contain object-left md:h-9"
						})
					}),
					/* @__PURE__ */ jsx("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: NAV.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => go(item.id),
								className: cn("flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium transition-all", section === item.id ? "bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.3)]" : "text-white/60 hover:bg-primary/15 hover:text-white"),
								children: [/* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }), item.label]
							}, item.id);
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 rounded-xl border border-white/10 bg-white/5 p-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/50",
							children: "Signed in"
						}), /* @__PURE__ */ jsx("div", {
							className: "truncate text-sm font-semibold text-white",
							children: authedAgent?.name || "Agent"
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-sidebar px-2 text-sm font-semibold text-white/80 hover:border-primary hover:text-white",
							onClick: onSignOut,
							children: [/* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }), "Sign out"]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "min-w-0 flex-1 px-4 py-4 pt-16 md:ml-[260px] md:px-8 md:py-6 md:pt-6",
				children: [
					section === "dashboard" && /* @__PURE__ */ jsxs(SectionView, { children: [
						/* @__PURE__ */ jsx(Header, {
							title: "Dashboard",
							onExport: () => openModal("export"),
							primaryLabel: "Quick Log",
							onPrimary: () => openModal("quick")
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5",
							children: [
								/* @__PURE__ */ jsx(Kpi, {
									icon: /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5" }),
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
								/* @__PURE__ */ jsx(Kpi, {
									icon: /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5" }),
									label: "Messages Today",
									value: String(kpis.msgsToday)
								}),
								/* @__PURE__ */ jsx(Kpi, {
									icon: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }),
									label: "Resolution Rate",
									value: `${kpis.resolution}%`,
									bar: kpis.resolution
								}),
								/* @__PURE__ */ jsx(Kpi, {
									icon: /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5" }),
									label: "Avg Handle Time",
									value: formatDuration(kpis.aht)
								}),
								/* @__PURE__ */ jsx(Kpi, {
									icon: /* @__PURE__ */ jsx(Star, { className: "h-5 w-5" }),
									label: "Quality Assurance",
									value: kpis.periodRated ? `${formatQa(kpis.csat)}/10` : kpis.ratedCount ? `${formatQa(kpis.allCsat)}/10` : "-",
									sub: kpis.ratedCount ? `${kpis.periodRated} last 14 days · ${kpis.ratedCount} on the log ${formatQa(kpis.allCsat)}${kpis.todayRatedCount ? ` · today ${formatQa(kpis.todayCsat)} (${kpis.todayRatedCount})` : ""}` : "No rated calls",
									accent: true
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-sm font-semibold text-fg",
								children: "Work queue"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex gap-2",
								children: ["mine", "team"].map((scope) => /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (queueScope === scope ? "border-primary bg-primary text-white" : "border-border bg-surface text-fg"),
									onClick: () => setQueueScope(scope),
									children: scope === "mine" ? "Mine" : "Team"
								}, scope))
							})]
						}),
						queueScope === "mine" && !meAgentId ? /* @__PURE__ */ jsx("div", {
							className: "rounded-xl border border-primary/30 bg-purple-50 px-4 py-3 text-sm",
							children: "Choose who you are in the sidebar to see your queue."
						}) : null,
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [
								/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: `Unrated QA (${unratedList.length})` }), unratedList.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "px-5 pb-5 text-sm text-muted",
								children: "No unrated calls in the last 2 days."
							}) : /* @__PURE__ */ jsx("div", {
								className: "max-h-[70vh] divide-y divide-border overflow-y-auto overscroll-contain",
								children: unratedList.map((c) => {
									const who = contactBits(customersById[c.customerId]);
									return /* @__PURE__ */ jsxs("div", {
										className: "px-4 py-3",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "text-sm font-semibold",
												children: [
													who.name,
													" ",
													who.phone ? /* @__PURE__ */ jsx("span", {
														className: "font-medium text-primary",
														children: who.phone
													}) : null
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "mt-0.5 text-xs text-muted",
												children: [
													c.type || "Inbound",
													" · ",
													formatDate(c.datetime),
													" · ",
													agentsById[c.agentId]?.name || "Unassigned"
												]
											}),
											/* @__PURE__ */ jsx("div", {
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
												].map((n) => /* @__PURE__ */ jsx("button", {
													type: "button",
													disabled: busy,
													className: "min-h-11 min-w-11 rounded-lg border-2 border-border bg-surface text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-50",
													onClick: () => void patchCall(c.id, { rating: n }),
													children: n
												}, n))
											})
										]
									}, c.id);
								})
							})] }),
								/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, {
							title: `Escalations (${queueScope === "mine" && meAgentId ? escalationItems.filter((e) => e.agentId === meAgentId).length : escalationStats.open})`
						}), (queueScope === "mine" && meAgentId ? escalationItems.filter((e) => e.agentId === meAgentId) : escalationItems).length === 0 ? /* @__PURE__ */ jsx("div", {
							className: "px-5 pb-5 text-sm text-muted",
							children: "No open escalations."
						}) : /* @__PURE__ */ jsx(EscalationList, {
							items: queueScope === "mine" && meAgentId ? escalationItems.filter((e) => e.agentId === meAgentId) : escalationItems,
							agents: agentsById,
							customers: customersById,
							busy,
							onOpen: (id) => openModal("call", id),
							onResolve: (id) => void patchCall(id, { outcome: "Resolved" }),
							onDue: (id, due) => void patchCall(id, { followUpAt: due })
						})] })
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Calls by Day" }), /* @__PURE__ */ jsx("div", {
								className: "h-[260px] p-4",
								children: /* @__PURE__ */ jsx(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ jsxs(BarChart, {
										isAnimationActive: false,
										data: callsByDay,
										children: [
											/* @__PURE__ */ jsx(CartesianGrid, {
												strokeDasharray: "3 3",
												stroke: "rgba(167,67,255,0.08)"
											}),
											/* @__PURE__ */ jsx(XAxis, {
												dataKey: "label",
												tick: { fontSize: 10 },
												interval: 0
											}),
											/* @__PURE__ */ jsx(YAxis, {
												allowDecimals: false,
												tick: { fontSize: 11 }
											}),
											/* @__PURE__ */ jsx(Tooltip, {}),
											/* @__PURE__ */ jsx(Bar, {
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
							})] }), /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Call Outcomes" }), /* @__PURE__ */ jsx("div", {
								className: "h-[260px] p-4",
								children: /* @__PURE__ */ jsx(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ jsxs(PieChart, {
										isAnimationActive: false, children: [/* @__PURE__ */ jsx(Pie, {
										isAnimationActive: false,
										data: outcomeData,
										dataKey: "value",
										nameKey: "name",
										innerRadius: 55,
										outerRadius: 90,
										paddingAngle: 2,
										children: outcomeData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
									}), /* @__PURE__ */ jsx(Tooltip, {})] })
								})
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, {
								title: "Calls Today",
								action: /* @__PURE__ */ jsx(Btn, {
									variant: "secondary",
									size: "sm",
									onClick: () => go("calls"),
									children: "View All"
								})
							}), todayCallsSorted.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "px-5 pb-5 text-sm text-muted",
								children: "No calls today."
							}) : /* @__PURE__ */ jsx("div", {
								className: "divide-y divide-border",
								children: todayCallsSorted.slice(0, 12).map((c) => {
									const cu = customersById[c.customerId];
									const who = contactBits(cu);
									return /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "flex w-full flex-col gap-0.5 px-5 py-3 text-left hover:bg-purple-50/60",
										onClick: () => openModal("call", c.id),
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center gap-2 text-sm",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "font-semibold",
													children: who.name
												}),
												who.phone ? /* @__PURE__ */ jsx("span", {
													className: "font-medium text-primary",
													children: who.phone
												}) : null,
												/* @__PURE__ */ jsx(Badge, {
													tone: "soft",
													children: c.type || "Inbound"
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
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
							})] }), /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, {
								title: "Recent Messages",
								action: /* @__PURE__ */ jsx(Btn, {
									variant: "secondary",
									size: "sm",
									onClick: () => go("messages"),
									children: "View All"
								})
							}), recentMsgs.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "px-6 py-10 text-center text-sm text-muted",
								children: "No messages yet."
							}) : /* @__PURE__ */ jsx("div", {
								className: "divide-y divide-border",
								children: recentMsgs.map((m) => /* @__PURE__ */ jsxs("button", {
									type: "button",
									className: "flex w-full flex-col gap-1 px-5 py-3 text-left hover:bg-purple-50/60",
									onClick: () => openModal("message", m.id),
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center gap-2 text-sm",
											children: [
												/* @__PURE__ */ jsx(Badge, {
													tone: "soft",
													children: m.channel
												}),
												/* @__PURE__ */ jsx("span", {
													className: "font-semibold",
													children: contactBits(customersById[m.customerId]).line
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-xs text-muted",
													children: formatDate(m.datetime)
												})
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "line-clamp-2 text-xs text-muted",
											children: [m.subject ? `${m.subject}: ` : "", m.body]
										}),
										m.notes ? /* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-primary",
											children: ["Note: ", shortNotes(m.notes, 80)]
										}) : null
									]
								}, m.id))
							})] })]
						})
					] }),
					section === "calls" && /* @__PURE__ */ jsxs(SectionView, { children: [
						/* @__PURE__ */ jsx(Header, {
							title: "Call Log",
							onExport: () => openModal("export"),
							onReconcile: () => {
								setReconcilePreview(null);
								openModal("reconcile");
							},
							primaryLabel: "Quick Log",
							onPrimary: () => openModal("quick")
						}),
						/* @__PURE__ */ jsxs(Toolbar, { children: [
							/* @__PURE__ */ jsx(SearchBox, {
								value: callSearch,
								onChange: setCallSearch,
								placeholder: "Name, phone, notes, date..."
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "flex min-h-11 min-w-[148px] flex-1 items-center gap-2 rounded-[10px] border border-border bg-bg px-3 text-sm sm:flex-none",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted",
										children: "From"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "date",
										className: "min-h-11 w-full bg-transparent text-fg outline-none",
										value: callDateFrom,
										onChange: (e) => setCallDateFrom(e.target.value)
									})
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "flex min-h-11 min-w-[148px] flex-1 items-center gap-2 rounded-[10px] border border-border bg-bg px-3 text-sm sm:flex-none",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted",
										children: "To"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "date",
										className: "min-h-11 w-full bg-transparent text-fg outline-none",
										value: callDateTo,
										onChange: (e) => setCallDateTo(e.target.value)
									})
								]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "min-h-11 rounded-[10px] border-2 border-border bg-surface px-3 text-sm font-semibold text-fg hover:border-primary hover:text-primary",
								onClick: () => {
									const d = todayStr();
									setCallDateFrom(d);
									setCallDateTo(d);
								},
								children: "Today"
							}),
							(callDateFrom || callDateTo) && /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "min-h-11 rounded-[10px] border-2 border-border bg-surface px-3 text-sm font-semibold text-muted hover:border-primary hover:text-primary",
								onClick: () => {
									setCallDateFrom("");
									setCallDateTo("");
								},
								children: "Clear dates"
							}),
							/* @__PURE__ */ jsxs("select", {
								className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[140px]",
								value: callOutcome,
								onChange: (e) => setCallOutcome(e.target.value),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "All Outcomes"
								}), OUTCOMES.map((o) => /* @__PURE__ */ jsx("option", {
									value: o,
									children: o
								}, o)), callOutcome && !OUTCOMES.includes(callOutcome) ? /* @__PURE__ */ jsx("option", {
									value: callOutcome,
									children: callOutcome
								}) : null]
							}),
							/* @__PURE__ */ jsxs("select", {
								className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[140px]",
								value: callAgent,
								onChange: (e) => setCallAgent(e.target.value),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "All Agents"
								}), data.agents.map((a) => /* @__PURE__ */ jsx("option", {
									value: a.id,
									children: a.name
								}, a.id))]
							}),
							/* @__PURE__ */ jsxs("select", {
								className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[140px]",
								value: callType,
								onChange: (e) => setCallType(e.target.value),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "All Types"
								}), CALL_TYPES.map((t) => /* @__PURE__ */ jsx("option", {
									value: t,
									children: t
								}, t))]
							})
						] }),
						/* @__PURE__ */ jsx(Card, { children: data.calls.filter(countsInCallLog).length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(Phone, { className: "h-12 w-12" }),
							title: "No calls yet",
							description: "Log your first call to get started."
						}) : filteredCalls.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(Phone, { className: "h-12 w-12" }),
							title: "No calls on these dates",
							description: "Try a different date or clear the date filter."
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(CallsTable, {
							calls: filteredCalls.slice(0, listLimit),
							agents: agentsById,
							customers: customersById,
							onEdit: (id) => openModal("call", id),
							onDelete: (id) => askDelete("Delete Call?", "Delete this call?", () => deleteCall({ data: { id } }).then(() => void 0))
						}), listLimit < filteredCalls.length ? /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "mt-3 min-h-11 w-full rounded-xl border border-border bg-surface text-sm font-semibold text-primary",
							onClick: () => setListLimit((n) => n + 40),
							children: `Show more · ${listLimit} of ${filteredCalls.length}`
						}) : null] }) })
					] }),
					section === "messages" && /* @__PURE__ */ jsxs(SectionView, { children: [
						/* @__PURE__ */ jsx(Header, {
							title: "Messages",
							onExport: () => openModal("export"),
							primaryLabel: "Quick Log",
							onPrimary: () => openModal("quick")
						}),
						/* @__PURE__ */ jsxs(Toolbar, { children: [
							/* @__PURE__ */ jsx(SearchBox, {
								value: msgSearch,
								onChange: setMsgSearch,
								placeholder: "Search..."
							}),
							/* @__PURE__ */ jsxs("select", {
								className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[130px]",
								value: msgChannel,
								onChange: (e) => setMsgChannel(e.target.value),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "All Channels"
								}), MESSAGE_CHANNELS.map((c) => /* @__PURE__ */ jsx("option", {
									value: c,
									children: c
								}, c))]
							}),
							/* @__PURE__ */ jsxs("select", {
								className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)] w-auto min-w-[130px]",
								value: msgStatus,
								onChange: (e) => setMsgStatus(e.target.value),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "All Statuses"
								}), MESSAGE_STATUSES.map((s) => /* @__PURE__ */ jsx("option", {
									value: s,
									children: s
								}, s))]
							})
						] }),
						/* @__PURE__ */ jsx(Card, { children: messages.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(MessageSquare, { className: "h-12 w-12" }),
							title: "No messages yet",
							description: "Log SMS, chat, or email conversations."
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Time"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Channel"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Dir"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Agent"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Customer"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Message"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Status"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Notes"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ jsx("tbody", { children: filteredMessages.slice(0, listLimit).map((m) => {
									const a = agentsById[m.agentId];
									const cu = customersById[m.customerId];
									return /* @__PURE__ */ jsxs("tr", {
										className: "border-t border-border hover:bg-purple-50/60",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "whitespace-nowrap px-4 py-3",
												children: formatDate(m.datetime)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ jsx(Badge, {
													tone: "soft",
													children: m.channel
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3 text-xs",
												children: m.direction
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: a?.name || "-"
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "px-4 py-3 font-medium",
												children: [/* @__PURE__ */ jsx("div", { children: cu?.name || "-" }), /* @__PURE__ */ jsx("div", {
													className: "text-xs font-medium text-primary",
													children: cu?.phone || "-"
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "max-w-[220px] px-4 py-3",
												children: [m.subject ? /* @__PURE__ */ jsx("div", {
													className: "text-xs font-semibold",
													children: m.subject
												}) : null, /* @__PURE__ */ jsx("div", {
													className: "truncate text-xs text-muted",
													children: m.body
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ jsx(Badge, {
													tone: msgStatusTone(m.status),
													children: m.status
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "max-w-[140px] truncate px-4 py-3 text-xs text-muted",
												title: m.notes || void 0,
												children: shortNotes(m.notes)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ jsx(RowActions, {
													onEdit: () => openModal("message", m.id),
													onDelete: () => askDelete("Delete Message?", "Delete this message?", () => deleteMessage({ data: { id: m.id } }).then(() => void 0))
												})
											})
										]
									}, m.id);
								}) })]
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-3 p-4 md:hidden",
							children: filteredMessages.slice(0, listLimit).map((m) => {
								const a = agentsById[m.agentId];
								const cu = customersById[m.customerId];
								return /* @__PURE__ */ jsx(MobileCard, {
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
						}), listLimit < filteredMessages.length ? /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "min-h-11 w-full rounded-none border-t border-border bg-surface px-4 py-3 text-sm font-semibold text-primary",
							onClick: () => setListLimit((n) => n + 40),
							children: `Show more · ${listLimit} of ${filteredMessages.length}`
						}) : null] }) })
					] }),
					section === "agents" && /* @__PURE__ */ jsxs(SectionView, { children: [/* @__PURE__ */ jsx(Header, {
						title: "Agents",
						onExport: () => openModal("export"),
						primaryLabel: "Add Agent",
						onPrimary: () => openModal("agent")
					}), /* @__PURE__ */ jsx(Card, { children: data.agents.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
						icon: /* @__PURE__ */ jsx(Users, { className: "h-12 w-12" }),
						title: "No agents yet",
						description: "Add your first agent."
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
						className: "hidden overflow-x-auto md:block",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Agent"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Role"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Calls today"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Msgs today"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Escalations"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Avg Time"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Resolution"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "QA week"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Status"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "px-4 py-3",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", { children: data.agents.map((a) => {
								const s = getAgentStats(data, a.id);
								const rate = s.todayCalls ? Math.round(s.todayResolutionRate * 100) : 0;
								return /* @__PURE__ */ jsxs("tr", {
									className: "border-t border-border hover:bg-purple-50/60",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(Avatar, { name: a.name }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
													className: "font-semibold",
													children: a.name
												}), /* @__PURE__ */ jsx("div", {
													className: "text-xs text-muted",
													children: a.email || "-"
												})] })]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: a.role
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3 font-semibold",
											children: s.todayCalls
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: s.todayMessages
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3 font-semibold",
											children: s.openEscalations
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: formatDuration(s.todayAvgDuration)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsxs("span", {
													className: "font-semibold",
													children: [rate, "%"]
												}), /* @__PURE__ */ jsx("div", {
													className: "h-1.5 w-20 overflow-hidden rounded-full bg-border",
													children: /* @__PURE__ */ jsx("div", {
														className: "h-full rounded-full bg-primary",
														style: { width: `${rate}%` }
													})
												})]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: s.weekRated > 0 ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
												className: "font-semibold text-primary",
												children: ["★ ", formatQa(s.weekQa)]
											}), /* @__PURE__ */ jsxs("div", {
												className: "text-[11px] text-muted",
												children: [
													s.weekRated,
													" this week",
													s.lastWeekRated ? ` · last ${formatQa(s.lastWeekQa)}` : ""
												]
											})] }) : /* @__PURE__ */ jsx("span", {
												className: "text-muted",
												children: "-"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsx(Badge, {
												tone: a.status === "Active" ? "strong" : "soft",
												children: a.status
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsx(RowActions, {
												onEdit: () => openModal("agent", a.id),
												onDelete: () => askDelete("Delete Agent?", "Delete this agent?", () => deleteAgent({ data: { id: a.id } }).then(() => void 0))
											})
										})
									]
								}, a.id);
							}) })]
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "space-y-3 p-4 md:hidden",
						children: data.agents.map((a) => {
							const s = getAgentStats(data, a.id);
							const rate = s.todayCalls ? Math.round(s.todayResolutionRate * 100) : 0;
							return /* @__PURE__ */ jsx(MobileCard, {
								title: a.name,
								subtitle: `${a.role} · ${a.status}`,
								rows: [
									["Calls today", String(s.todayCalls)],
									["Msgs today", String(s.todayMessages)],
									["Escalations", String(s.openEscalations)],
									["Avg Time", formatDuration(s.todayAvgDuration)],
									["Resolution", `${rate}%`],
									["QA week", s.weekRated ? `★ ${formatQa(s.weekQa)} (${s.weekRated})` : "-"]
								],
								onEdit: () => openModal("agent", a.id),
								onDelete: () => askDelete("Delete Agent?", "Delete this agent?", () => deleteAgent({ data: { id: a.id } }).then(() => void 0))
							}, a.id);
						})
					})] }) })] }),
					section === "customers" && /* @__PURE__ */ jsxs(SectionView, { children: [
						/* @__PURE__ */ jsx(Header, {
							title: "Customers",
							onExport: () => openModal("export"),
							primaryLabel: "Add Customer",
							onPrimary: () => openModal("customer")
						}),
						/* @__PURE__ */ jsxs(Toolbar, { children: [/* @__PURE__ */ jsx(SearchBox, {
							value: customerSearch,
							onChange: setCustomerSearch,
							placeholder: "Search..."
						}), selectedCustomerId ? /* @__PURE__ */ jsx(Btn, {
							variant: "secondary",
							onClick: () => setSelectedCustomerId(null),
							children: "All customers"
						}) : null] }),
						selectedCustomerId ? /* @__PURE__ */ jsx(CustomerTimeline, {
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
						}) : /* @__PURE__ */ jsx(Card, { children: data.customers.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(UserRound, { className: "h-12 w-12" }),
							title: "No customers yet",
							description: "Add your first customer."
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Name"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Phone"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Email"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Client"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Calls"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Msgs"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Notes"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Last Contact"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ jsx("tbody", { children: filteredCustomers.slice(0, listLimit).map((c) => {
									const s = getCustomerStats(data, c.id);
									return /* @__PURE__ */ jsxs("tr", {
										className: "cursor-pointer border-t border-border hover:bg-purple-50/60",
										onClick: () => setSelectedCustomerId(c.id),
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3 font-semibold",
												children: c.name
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: c.phone
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: c.email || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: customerCompanyLabel(c, clientsById)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3 font-semibold",
												children: s.total
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: s.messages
											}),
											/* @__PURE__ */ jsx("td", {
												className: "max-w-[200px] truncate px-4 py-3 text-xs text-muted",
												title: s.activityNotes || void 0,
												children: shortNotes(s.activityNotes)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: s.lastContact ? formatDate(s.lastContact) : "Never"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												onClick: (e) => e.stopPropagation(),
												children: /* @__PURE__ */ jsx(RowActions, {
													onEdit: () => openModal("customer", c.id),
													onDelete: () => askDelete("Delete Customer?", "Delete this customer?", () => deleteCustomer({ data: { id: c.id } }).then(() => void 0))
												})
											})
										]
									}, c.id);
								}) })]
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-3 p-4 md:hidden",
							children: filteredCustomers.slice(0, listLimit).map((c) => {
								const s = getCustomerStats(data, c.id);
								return /* @__PURE__ */ jsx(MobileCard, {
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
						}), listLimit < filteredCustomers.length ? /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "min-h-11 w-full rounded-none border-t border-border bg-surface px-4 py-3 text-sm font-semibold text-primary",
							onClick: () => setListLimit((n) => n + 40),
							children: `Show more · ${listLimit} of ${filteredCustomers.length}`
						}) : null] }) })
					] }),
					section === "clients" && /* @__PURE__ */ jsxs(SectionView, { children: [
						/* @__PURE__ */ jsx(Header, {
							title: "Clients",
							onExport: () => openModal("export"),
							primaryLabel: "Add Client",
							onPrimary: () => openModal("client")
						}),
						/* @__PURE__ */ jsxs(Toolbar, { children: [/* @__PURE__ */ jsx(SearchBox, {
							value: clientSearch,
							onChange: setClientSearch,
							placeholder: "Search clients..."
						}), selectedClientId ? /* @__PURE__ */ jsx(Btn, {
							variant: "secondary",
							onClick: () => setSelectedClientId(null),
							children: "All clients"
						}) : null] }),
						!selectedClientId ? /* @__PURE__ */ jsx(Card, { children: data.clients.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12" }),
							title: "No clients yet",
							description: "Add your first client."
						}) : filteredClients.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12" }),
							title: "No matches",
							description: "Try a different search."
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
							className: "hidden overflow-x-auto md:block",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Company"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Status"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Customers"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Calls"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Messages"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Notes"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Last activity"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ jsx("tbody", { children: filteredClients.slice(0, listLimit).map((c) => {
									const s = getClientStats(data, c.id);
									return /* @__PURE__ */ jsxs("tr", {
										className: "cursor-pointer border-t border-border hover:bg-purple-50/60",
										onClick: () => setSelectedClientId(c.id),
										children: [
											/* @__PURE__ */ jsxs("td", {
												className: "px-4 py-3",
												children: [/* @__PURE__ */ jsx("div", {
													className: "font-semibold",
													children: c.name
												}), c.industry ? /* @__PURE__ */ jsx("div", {
													className: "text-xs text-muted",
													children: c.industry
												}) : null]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: /* @__PURE__ */ jsx(Badge, {
													tone: c.status === "Active" ? "strong" : "soft",
													children: c.status
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3 font-semibold",
												children: s.contacts
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: s.calls
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												children: s.messages
											}),
											/* @__PURE__ */ jsx("td", {
												className: "max-w-[200px] truncate px-4 py-3 text-xs text-muted",
												title: s.allNotes || void 0,
												children: shortNotes(s.allNotes)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3 text-xs",
												children: s.lastActivity ? formatDate(s.lastActivity) : "Never"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-3",
												onClick: (e) => e.stopPropagation(),
												children: /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(Btn, {
														variant: "secondary",
														onClick: () => setSelectedClientId(c.id),
														children: "Open"
													}), /* @__PURE__ */ jsx(RowActions, {
														onEdit: () => openModal("client", c.id),
														onDelete: () => askDelete("Delete Client?", "Delete this client?", () => deleteClient({ data: { id: c.id } }).then(() => void 0))
													})]
												})
											})
										]
									}, c.id);
								}) })]
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-3 p-4 md:hidden",
							children: filteredClients.slice(0, listLimit).map((c) => {
								const s = getClientStats(data, c.id);
								return /* @__PURE__ */ jsxs("button", {
									type: "button",
									className: "w-full rounded-xl border border-border bg-surface p-4 text-left shadow-sm",
									onClick: () => setSelectedClientId(c.id),
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "mb-2 flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
												className: "font-bold text-fg",
												children: c.name
											}), /* @__PURE__ */ jsx("div", {
												className: "text-xs text-muted",
												children: c.industry || "Company"
											})] }), /* @__PURE__ */ jsx(Badge, {
												tone: c.status === "Active" ? "strong" : "soft",
												children: c.status
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-3 gap-2 text-center text-xs",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "rounded-lg bg-purple-50 p-2",
													children: [/* @__PURE__ */ jsx("div", {
														className: "font-bold text-primary",
														children: s.contacts
													}), /* @__PURE__ */ jsx("div", {
														className: "text-muted",
														children: "Customers"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "rounded-lg bg-purple-50 p-2",
													children: [/* @__PURE__ */ jsx("div", {
														className: "font-bold text-primary",
														children: s.calls
													}), /* @__PURE__ */ jsx("div", {
														className: "text-muted",
														children: "Calls"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "rounded-lg bg-purple-50 p-2",
													children: [/* @__PURE__ */ jsx("div", {
														className: "font-bold text-primary",
														children: s.messages
													}), /* @__PURE__ */ jsx("div", {
														className: "text-muted",
														children: "Messages"
													})]
												})
											]
										}),
										s.allNotes ? /* @__PURE__ */ jsx("div", {
											className: "mt-2 line-clamp-2 text-xs text-muted",
											children: s.allNotes
										}) : null
									]
								}, c.id);
							})
						}), listLimit < filteredClients.length ? /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "min-h-11 w-full rounded-none border-t border-border bg-surface px-4 py-3 text-sm font-semibold text-primary",
							onClick: () => setListLimit((n) => n + 40),
							children: `Show more · ${listLimit} of ${filteredClients.length}`
						}) : null] }) }) : (() => {
							const client = clientsById[selectedClientId];
							if (!client) return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(EmptyState, {
								icon: /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12" }),
								title: "Client not found",
								description: "Go back to the client list."
							}) });
							const s = getClientStats(data, client.id);
							return /* @__PURE__ */ jsxs("div", {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "min-w-0",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "mb-2 flex flex-wrap items-center gap-2",
													children: [/* @__PURE__ */ jsx("h2", {
														className: "text-xl font-bold text-fg",
														children: client.name
													}), /* @__PURE__ */ jsx(Badge, {
														tone: client.status === "Active" ? "strong" : "soft",
														children: client.status
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted",
													children: [
														client.industry ? /* @__PURE__ */ jsx("span", { children: client.industry }) : null,
														client.phone ? /* @__PURE__ */ jsx("span", { children: client.phone }) : null,
														client.email ? /* @__PURE__ */ jsx("span", { children: client.email }) : null,
														client.website ? /* @__PURE__ */ jsx("span", { children: client.website }) : null
													]
												}),
												client.notes?.trim() ? /* @__PURE__ */ jsxs("p", {
													className: "mt-3 whitespace-pre-wrap text-sm text-fg",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "font-semibold text-muted",
														children: ["Notes:", " "]
													}), client.notes]
												}) : /* @__PURE__ */ jsx("p", {
													className: "mt-3 text-sm text-muted",
													children: "No account notes"
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex shrink-0 flex-wrap gap-2",
											children: [
												/* @__PURE__ */ jsx(Btn, {
													variant: "secondary",
													onClick: () => openModal("client", client.id),
													children: "Edit"
												}),
												/* @__PURE__ */ jsxs(Btn, {
													variant: "secondary",
													onClick: () => openModal("quick", client.id),
													children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), "Quick Log"]
												}),
												/* @__PURE__ */ jsxs(Btn, {
													variant: "secondary",
													onClick: () => exportCsv("client-report", client.id),
													children: [/* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }), "CSV"]
												}),
												/* @__PURE__ */ jsxs(Btn, {
													onClick: () => exportPdf(client.id),
													disabled: busy,
													children: [/* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }), busy ? "Preparing PDF" : "PDF report"]
												})
											]
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "grid grid-cols-2 gap-3 border-t border-border p-4 sm:grid-cols-3 lg:grid-cols-6",
										children: [
											["Customers", s.contacts],
											["Calls", s.calls],
											["Messages", s.messages],
											["Resolved", s.resolved],
											["Escalated", s.escalated],
											["Avg handle", formatDuration(s.avgDuration)]
										].map(([label, value]) => /* @__PURE__ */ jsxs("div", {
											className: "rounded-xl bg-purple-50 px-3 py-3 text-center",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-lg font-bold text-primary",
												children: value
											}), /* @__PURE__ */ jsx("div", {
												className: "text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: label
											})]
										}, String(label)))
									})] }),
									/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: `Customers (${s.contacts})` }), s.contactList.length === 0 ? /* @__PURE__ */ jsx("div", {
										className: "px-5 pb-5 text-sm text-muted",
										children: "No customers linked to this client yet."
									}) : /* @__PURE__ */ jsx("div", {
										className: "max-h-80 overflow-auto",
										children: /* @__PURE__ */ jsxs("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
												className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: [
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Name"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Phone"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Calls"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Msgs"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Notes"
													})
												]
											}) }), /* @__PURE__ */ jsx("tbody", { children: s.contactList.map((cu) => {
												const cs = getCustomerStats(data, cu.id);
												return /* @__PURE__ */ jsxs("tr", {
													className: "border-t border-border",
													children: [
														/* @__PURE__ */ jsx("td", {
															className: "px-4 py-2 font-semibold",
															children: cu.name
														}),
														/* @__PURE__ */ jsx("td", {
															className: "px-4 py-2",
															children: cu.phone
														}),
														/* @__PURE__ */ jsx("td", {
															className: "px-4 py-2",
															children: cs.total
														}),
														/* @__PURE__ */ jsx("td", {
															className: "px-4 py-2",
															children: cs.messages
														}),
														/* @__PURE__ */ jsx("td", {
															className: "max-w-[140px] truncate px-4 py-2 text-xs text-muted",
															title: cs.activityNotes || void 0,
															children: shortNotes(cs.activityNotes)
														})
													]
												}, cu.id);
											}) })]
										})
									})] }),
									/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: `Calls (${s.calls})` }), s.callList.length === 0 ? /* @__PURE__ */ jsx("div", {
										className: "px-5 pb-5 text-sm text-muted",
										children: "No calls for this client yet."
									}) : /* @__PURE__ */ jsxs("div", {
										className: "max-h-96 overflow-auto",
										children: [/* @__PURE__ */ jsxs("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
												className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: [
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "When"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Agent"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Customer"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Phone"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Type"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Duration"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Outcome"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Notes"
													})
												]
											}) }), /* @__PURE__ */ jsx("tbody", { children: s.callList.slice(0, 50).map((call) => /* @__PURE__ */ jsxs("tr", {
												className: "border-t border-border",
												children: [
													/* @__PURE__ */ jsx("td", {
														className: "whitespace-nowrap px-4 py-2 text-xs",
														children: formatDate(call.datetime)
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: agentsById[call.agentId]?.name || "-"
													}),
													/* @__PURE__ */ jsxs("td", {
														className: "px-4 py-2",
														children: [/* @__PURE__ */ jsx("div", { children: customersById[call.customerId]?.name || "-" }), /* @__PURE__ */ jsx("div", {
															className: "text-xs font-medium text-primary",
															children: customersById[call.customerId]?.phone || "-"
														})]
													}),
													/* @__PURE__ */ jsx("td", {
														className: "whitespace-nowrap px-4 py-2",
														children: customersById[call.customerId]?.phone || "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: call.type
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: formatDuration(call.duration)
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: /* @__PURE__ */ jsx(Badge, {
															tone: call.outcome === "Resolved" ? "strong" : "soft",
															children: call.outcome
														})
													}),
													/* @__PURE__ */ jsx("td", {
														className: "max-w-[160px] truncate px-4 py-2 text-xs text-muted",
														title: call.notes || void 0,
														children: shortNotes(call.notes)
													})
												]
											}, call.id)) })]
										}), s.callList.length > 50 ? /* @__PURE__ */ jsxs("div", {
											className: "border-t border-border px-4 py-2 text-xs text-muted",
											children: [
												"Showing 50 of ",
												s.callList.length,
												". Use Bi-weekly CSV for the full export."
											]
										}) : null]
									})] }),
									/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: `Messages (${s.messages})` }), s.messageList.length === 0 ? /* @__PURE__ */ jsx("div", {
										className: "px-5 pb-5 text-sm text-muted",
										children: "No messages for this client yet."
									}) : /* @__PURE__ */ jsx("div", {
										className: "max-h-80 overflow-auto",
										children: /* @__PURE__ */ jsxs("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
												className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
												children: [
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "When"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Agent"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Customer"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Channel"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Status"
													}),
													/* @__PURE__ */ jsx("th", {
														className: "px-4 py-2",
														children: "Notes"
													})
												]
											}) }), /* @__PURE__ */ jsx("tbody", { children: s.messageList.slice(0, 50).map((m) => /* @__PURE__ */ jsxs("tr", {
												className: "border-t border-border",
												children: [
													/* @__PURE__ */ jsx("td", {
														className: "whitespace-nowrap px-4 py-2 text-xs",
														children: formatDate(m.datetime)
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: agentsById[m.agentId]?.name || "-"
													}),
													/* @__PURE__ */ jsxs("td", {
														className: "px-4 py-2",
														children: [/* @__PURE__ */ jsx("div", { children: customersById[m.customerId]?.name || "-" }), /* @__PURE__ */ jsx("div", {
															className: "text-xs font-medium text-primary",
															children: customersById[m.customerId]?.phone || "-"
														})]
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: m.channel
													}),
													/* @__PURE__ */ jsx("td", {
														className: "px-4 py-2",
														children: m.status
													}),
													/* @__PURE__ */ jsx("td", {
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
					section === "analytics" && /* @__PURE__ */ jsxs(SectionView, { children: [
						/* @__PURE__ */ jsx(Header, {
							title: "Analytics",
							onExport: () => openModal("export")
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex gap-1 overflow-x-auto border-b border-border",
							children: [
								["performance", "Performance"],
								["trends", "Trends"],
								["rank", "Agent Rankings"]
							].map(([id, label]) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setAnalyticsTab(id),
								className: cn("shrink-0 border-b-2 px-5 py-2.5 text-sm font-semibold transition", analyticsTab === id ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary"),
								children: label
							}, id))
						}),
						analyticsTab === "performance" && /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
							children: [/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Daily Volume (Last 7 Days)" }), /* @__PURE__ */ jsx("div", {
								className: "h-[280px] p-4",
								children: /* @__PURE__ */ jsx(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ jsxs(LineChart, {
										isAnimationActive: false,
										data: dailyVolume,
										children: [
											/* @__PURE__ */ jsx(CartesianGrid, {
												strokeDasharray: "3 3",
												stroke: "rgba(167,67,255,0.08)"
											}),
											/* @__PURE__ */ jsx(XAxis, {
												dataKey: "label",
												tick: { fontSize: 11 }
											}),
											/* @__PURE__ */ jsx(YAxis, {
												allowDecimals: false,
												tick: { fontSize: 11 }
											}),
											/* @__PURE__ */ jsx(Tooltip, {}),
											/* @__PURE__ */ jsx(Line, {
												type: "monotone",
												dataKey: "calls",
												name: "Calls",
												stroke: "#a743ff",
												strokeWidth: 2,
												dot: { fill: "#a743ff" }
											}),
											/* @__PURE__ */ jsx(Line, {
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
							})] }), /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Outcome Breakdown" }), /* @__PURE__ */ jsx("div", {
								className: "h-[280px] p-4",
								children: /* @__PURE__ */ jsx(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ jsxs(PieChart, {
										isAnimationActive: false, children: [/* @__PURE__ */ jsx(Pie, {
										isAnimationActive: false,
										data: outcomeData,
										dataKey: "value",
										nameKey: "name",
										outerRadius: 100,
										children: outcomeData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
									}), /* @__PURE__ */ jsx(Tooltip, {})] })
								})
							})] })]
						}),
						analyticsTab === "trends" && /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Average Handle Time Trend" }), /* @__PURE__ */ jsx("div", {
							className: "h-[300px] p-4",
							children: /* @__PURE__ */ jsx(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ jsxs(LineChart, {
										isAnimationActive: false,
									data: ahtTrend,
									children: [
										/* @__PURE__ */ jsx(CartesianGrid, {
											strokeDasharray: "3 3",
											stroke: "rgba(167,67,255,0.08)"
										}),
										/* @__PURE__ */ jsx(XAxis, {
											dataKey: "label",
											tick: { fontSize: 11 }
										}),
										/* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 11 } }),
										/* @__PURE__ */ jsx(Tooltip, {}),
										/* @__PURE__ */ jsx(Line, {
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
						analyticsTab === "rank" && /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Top Performing Agents" }), agentRankings.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: /* @__PURE__ */ jsx(Users, { className: "h-12 w-12" }),
							title: "No data yet"
						}) : /* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Rank"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Agent"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Calls"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Msgs"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Resolution"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Avg Time"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "QA"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-4 py-3",
											children: "Score"
										})
									]
								}) }), /* @__PURE__ */ jsx("tbody", { children: agentRankings.map((r, i) => /* @__PURE__ */ jsxs("tr", {
									className: "border-t border-border",
									children: [
										/* @__PURE__ */ jsxs("td", {
											className: "px-4 py-3 text-lg font-bold text-primary",
											children: ["#", i + 1]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(Avatar, { name: r.agent.name }), r.agent.name]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: r.total
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: r.messages
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "px-4 py-3",
											children: [Math.round(r.resolutionRate * 100), "%"]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: formatDuration(r.avgDuration)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-4 py-3",
											children: r.csat ? formatQa(r.csat) : "-"
										}),
										/* @__PURE__ */ jsx("td", {
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
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "quick",
				onClose: () => setModal(null),
				title: "Quick Log",
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					type: "submit",
					form: "quick-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save"
				})] }),
				children: /* @__PURE__ */ jsxs("form", {
					id: "quick-form",
					onSubmit: onSaveQuick,
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "sm:col-span-2 flex gap-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.mode === "call" ? "border-primary bg-primary text-white" : "border-border bg-surface text-fg"),
								onClick: () => setQuickForm((f) => ({
									...f,
									mode: "call"
								})),
								children: "Call"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.mode === "message" ? "border-primary bg-primary text-white" : "border-border bg-surface text-fg"),
								onClick: () => setQuickForm((f) => ({
									...f,
									mode: "message"
								})),
								children: "Message"
							})]
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Phone *",
							children: /* @__PURE__ */ jsx("input", {
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
						/* @__PURE__ */ jsx(Field, {
							label: "Name",
							children: /* @__PURE__ */ jsx("input", {
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
							return /* @__PURE__ */ jsxs("div", {
								className: "sm:col-span-2 rounded-xl border border-primary/30 bg-purple-50 p-3 text-sm",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "font-semibold",
									children: [
										"This number is ",
										match.name,
										". Use the new name?"
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (nameOverwrite === "keep" ? "border-primary bg-primary text-white" : "border-border bg-surface"),
										onClick: () => setNameOverwrite("keep"),
										children: ["Keep ", match.name]
									}), /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (nameOverwrite === "replace" ? "border-primary bg-primary text-white" : "border-border bg-surface"),
										onClick: () => setNameOverwrite("replace"),
										children: ["Save as ", quickForm.name.trim()]
									})]
								})]
							});
						})(),
						/* @__PURE__ */ jsx(Field, {
							label: "Agent *",
							children: /* @__PURE__ */ jsxs("select", {
								required: true,
								className: inputClass,
								value: quickForm.agentId,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									agentId: e.target.value
								})),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Select agent"
								}), data.agents.map((a) => /* @__PURE__ */ jsx("option", {
									value: a.id,
									children: a.name
								}, a.id))]
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Client",
							children: /* @__PURE__ */ jsxs("select", {
								className: inputClass,
								value: quickForm.clientId,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									clientId: e.target.value
								})),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "None"
								}), data.clients.map((c) => /* @__PURE__ */ jsx("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						}),
						quickForm.mode === "call" ? /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Type of call",
								children: /* @__PURE__ */ jsx("select", {
									className: inputClass,
									value: quickForm.type,
									onChange: (e) => setQuickForm((f) => ({
										...f,
										type: e.target.value
									})),
									children: CALL_TYPES.map((t) => /* @__PURE__ */ jsx("option", {
										value: t,
										children: t
									}, t))
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Duration (min)",
								children: /* @__PURE__ */ jsx("input", {
									className: inputClass,
									value: quickForm.duration,
									onChange: (e) => setQuickForm((f) => ({
										...f,
										duration: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Outcome",
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap gap-2",
									children: OUTCOMES.map((o) => /* @__PURE__ */ jsx("button", {
										type: "button",
										className: "min-h-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.outcome === o ? "border-primary bg-primary text-white" : "border-border bg-surface text-fg"),
										onClick: () => setQuickForm((f) => ({
											...f,
											outcome: o,
											followUpAt: o === "Follow-up" || o === "Escalated" ? f.followUpAt || dateOffsetStr(1) : f.followUpAt
										})),
										children: o
									}, o))
								})
							}),
							(quickForm.outcome === "Follow-up" || quickForm.outcome === "Escalated") && /* @__PURE__ */ jsx(Field, {
								label: "Follow-up due",
								children: /* @__PURE__ */ jsx("input", {
									type: "date",
									className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)]",
									value: quickForm.followUpAt,
									onChange: (e) => setQuickForm((f) => ({
										...f,
										followUpAt: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "QA score /10",
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx("div", {
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
									].map((r) => /* @__PURE__ */ jsx("button", {
										type: "button",
										className: "min-h-11 min-w-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (quickForm.rating === r ? "border-primary bg-primary text-white" : "border-border bg-surface text-fg"),
										onClick: () => setQuickForm((f) => ({
											...f,
											rating: r
										})),
										children: r ? r : "Later"
									}, r || "none"))
								})
							})
						] }) : /* @__PURE__ */ jsx(Field, {
							label: "Channel",
							children: /* @__PURE__ */ jsx("select", {
								className: inputClass,
								value: quickForm.channel,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									channel: e.target.value
								})),
								children: MESSAGE_CHANNELS.map((c) => /* @__PURE__ */ jsx("option", {
									value: c,
									children: c
								}, c))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "When",
							children: /* @__PURE__ */ jsx("input", {
								type: "datetime-local",
								className: inputClass,
								value: quickForm.datetime,
								onChange: (e) => setQuickForm((f) => ({
									...f,
									datetime: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Notes *",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ jsx("textarea", {
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
						/* @__PURE__ */ jsx("p", {
							className: "sm:col-span-2 text-xs text-muted",
							children: "One step: saves to the shared call/message log. Existing numbers are matched automatically; new numbers create a customer."
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "call",
				onClose: () => setModal(null),
				title: editId ? "Edit Call" : "Log New Call",
				wide: true,
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					type: "submit",
					form: "call-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Call"
				})] }),
				children: /* @__PURE__ */ jsxs("form", {
					id: "call-form",
					onSubmit: onSaveCall,
					className: "space-y-4",
					children: [
						(!data.agents.length || !data.customers.length) && /* @__PURE__ */ jsx("div", {
							className: "rounded-[10px] border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800",
							children: "Add an agent and customer first."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Date & Time *",
									children: /* @__PURE__ */ jsx("input", {
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
								/* @__PURE__ */ jsx(Field, {
									label: "Agent *",
									children: /* @__PURE__ */ jsxs("select", {
										required: true,
										className: inputClass,
										value: callForm.agentId,
										onChange: (e) => setCallForm((f) => ({
											...f,
											agentId: e.target.value
										})),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Select agent"
										}), data.agents.map((a) => /* @__PURE__ */ jsx("option", {
											value: a.id,
											children: a.name
										}, a.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Customer *",
									children: /* @__PURE__ */ jsxs("select", {
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
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Select customer"
										}), data.customers.map((c) => /* @__PURE__ */ jsx("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Client",
									children: /* @__PURE__ */ jsxs("select", {
										className: inputClass,
										value: callForm.clientId,
										onChange: (e) => setCallForm((f) => ({
											...f,
											clientId: e.target.value
										})),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "None"
										}), data.clients.map((c) => /* @__PURE__ */ jsx("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Type",
									children: /* @__PURE__ */ jsx("select", {
										className: inputClass,
										value: callForm.type,
										onChange: (e) => setCallForm((f) => ({
											...f,
											type: e.target.value
										})),
										children: CALL_TYPES.map((t) => /* @__PURE__ */ jsx("option", { children: t }, t))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Duration (mins) *",
									children: /* @__PURE__ */ jsx("input", {
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
								/* @__PURE__ */ jsx(Field, {
									label: "Outcome *",
									children: /* @__PURE__ */ jsx("select", {
										required: true,
										className: inputClass,
										value: callForm.outcome,
										onChange: (e) => setCallForm((f) => ({
											...f,
											outcome: e.target.value,
											followUpAt: e.target.value === "Follow-up" || e.target.value === "Escalated" ? f.followUpAt || dateOffsetStr(1) : f.followUpAt
										})),
										children: (OUTCOMES.includes(callForm.outcome) ? OUTCOMES : [...OUTCOMES, callForm.outcome]).map((o) => /* @__PURE__ */ jsx("option", { children: o }, o))
									})
								}),
								(callForm.outcome === "Follow-up" || callForm.outcome === "Escalated") && /* @__PURE__ */ jsx(Field, {
									label: "Follow-up due",
									children: /* @__PURE__ */ jsx("input", {
										type: "date",
										className: "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.12)]",
										value: callForm.followUpAt,
										onChange: (e) => setCallForm((f) => ({
											...f,
											followUpAt: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "QA score /10",
									children: /* @__PURE__ */ jsx("div", {
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
										].map((r) => /* @__PURE__ */ jsx("button", {
											type: "button",
											className: "min-h-11 min-w-11 rounded-lg border-2 px-3 py-2 text-sm font-semibold " + (callForm.rating === r ? "border-primary bg-primary text-white" : "border-border bg-surface text-fg"),
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
						/* @__PURE__ */ jsx(Field, {
							label: "Notes",
							children: /* @__PURE__ */ jsx("textarea", {
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
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "message",
				onClose: () => setModal(null),
				title: editId ? "Edit Message" : "Log Message",
				wide: true,
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					type: "submit",
					form: "message-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Message"
				})] }),
				children: /* @__PURE__ */ jsxs("form", {
					id: "message-form",
					onSubmit: onSaveMessage,
					className: "space-y-4",
					children: [
						(!data.agents.length || !data.customers.length) && /* @__PURE__ */ jsx("div", {
							className: "rounded-[10px] border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800",
							children: "Add an agent and customer first."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Date & Time *",
									children: /* @__PURE__ */ jsx("input", {
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
								/* @__PURE__ */ jsx(Field, {
									label: "Agent *",
									children: /* @__PURE__ */ jsxs("select", {
										required: true,
										className: inputClass,
										value: msgForm.agentId,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											agentId: e.target.value
										})),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Select agent"
										}), data.agents.map((a) => /* @__PURE__ */ jsx("option", {
											value: a.id,
											children: a.name
										}, a.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Customer *",
									children: /* @__PURE__ */ jsxs("select", {
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
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Select customer"
										}), data.customers.map((c) => /* @__PURE__ */ jsx("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Client",
									children: /* @__PURE__ */ jsxs("select", {
										className: inputClass,
										value: msgForm.clientId,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											clientId: e.target.value
										})),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "None"
										}), data.clients.map((c) => /* @__PURE__ */ jsx("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Channel",
									children: /* @__PURE__ */ jsx("select", {
										className: inputClass,
										value: msgForm.channel,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											channel: e.target.value
										})),
										children: MESSAGE_CHANNELS.map((c) => /* @__PURE__ */ jsx("option", { children: c }, c))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Direction",
									children: /* @__PURE__ */ jsx("select", {
										className: inputClass,
										value: msgForm.direction,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											direction: e.target.value
										})),
										children: MESSAGE_DIRECTIONS.map((d) => /* @__PURE__ */ jsx("option", { children: d }, d))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Status",
									children: /* @__PURE__ */ jsx("select", {
										className: inputClass,
										value: msgForm.status,
										onChange: (e) => setMsgForm((f) => ({
											...f,
											status: e.target.value
										})),
										children: MESSAGE_STATUSES.map((s) => /* @__PURE__ */ jsx("option", { children: s }, s))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Subject",
									children: /* @__PURE__ */ jsx("input", {
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
						/* @__PURE__ */ jsx(Field, {
							label: "Message body *",
							children: /* @__PURE__ */ jsx("textarea", {
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
						/* @__PURE__ */ jsx(Field, {
							label: "Notes",
							children: /* @__PURE__ */ jsx("textarea", {
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
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "agent",
				onClose: () => setModal(null),
				title: editId ? "Edit Agent" : "Add Agent",
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					type: "submit",
					form: "agent-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Agent"
				})] }),
				children: /* @__PURE__ */ jsxs("form", {
					id: "agent-form",
					onSubmit: onSaveAgent,
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Full Name *",
							children: /* @__PURE__ */ jsx("input", {
								required: true,
								className: inputClass,
								value: agentForm.name,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									name: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Email",
							children: /* @__PURE__ */ jsx("input", {
								type: "email",
								className: inputClass,
								value: agentForm.email,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									email: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Role",
							children: /* @__PURE__ */ jsx("select", {
								className: inputClass,
								value: agentForm.role,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									role: e.target.value
								})),
								children: AGENT_ROLES.map((r) => /* @__PURE__ */ jsx("option", { children: r }, r))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Status",
							children: /* @__PURE__ */ jsx("select", {
								className: inputClass,
								value: agentForm.status,
								onChange: (e) => setAgentForm((f) => ({
									...f,
									status: e.target.value
								})),
								children: AGENT_STATUSES.map((s) => /* @__PURE__ */ jsx("option", { children: s }, s))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: editId ? "New password" : "Password *",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ jsx("input", {
								type: "password",
								required: !editId,
								autoComplete: "new-password",
								className: inputClass,
								value: agentForm.password,
								placeholder: editId ? "Leave blank to keep" : "",
								onChange: (e) => setAgentForm((f) => ({
									...f,
									password: e.target.value
								}))
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "customer",
				onClose: () => setModal(null),
				title: editId ? "Edit Customer" : "Add Customer",
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					type: "submit",
					form: "customer-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Customer"
				})] }),
				children: /* @__PURE__ */ jsxs("form", {
					id: "customer-form",
					onSubmit: onSaveCustomer,
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Name *",
							children: /* @__PURE__ */ jsx("input", {
								required: true,
								className: inputClass,
								value: customerForm.name,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									name: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Phone *",
							children: /* @__PURE__ */ jsx("input", {
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
						/* @__PURE__ */ jsx(Field, {
							label: "Email",
							children: /* @__PURE__ */ jsx("input", {
								type: "email",
								className: inputClass,
								value: customerForm.email,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									email: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Client",
							children: /* @__PURE__ */ jsxs("select", {
								className: inputClass,
								value: customerForm.clientId,
								onChange: (e) => setCustomerForm((f) => ({
									...f,
									clientId: e.target.value
								})),
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "None"
								}), data.clients.map((c) => /* @__PURE__ */ jsx("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Company",
							children: /* @__PURE__ */ jsx("input", {
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
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "client",
				onClose: () => setModal(null),
				title: editId ? "Edit Client" : "Add Client",
				wide: true,
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => setModal(null),
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					type: "submit",
					form: "client-form",
					disabled: busy,
					children: busy ? "Saving…" : "Save Client"
				})] }),
				children: /* @__PURE__ */ jsxs("form", {
					id: "client-form",
					onSubmit: onSaveClient,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Company Name *",
									children: /* @__PURE__ */ jsx("input", {
										required: true,
										className: inputClass,
										value: clientForm.name,
										onChange: (e) => setClientForm((f) => ({
											...f,
											name: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Industry",
									children: /* @__PURE__ */ jsx("input", {
										className: inputClass,
										value: clientForm.industry,
										onChange: (e) => setClientForm((f) => ({
											...f,
											industry: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Phone",
									children: /* @__PURE__ */ jsx("input", {
										type: "tel",
										className: inputClass,
										value: clientForm.phone,
										onChange: (e) => setClientForm((f) => ({
											...f,
											phone: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Email",
									children: /* @__PURE__ */ jsx("input", {
										type: "email",
										className: inputClass,
										value: clientForm.email,
										onChange: (e) => setClientForm((f) => ({
											...f,
											email: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Website",
									children: /* @__PURE__ */ jsx("input", {
										type: "url",
										className: inputClass,
										value: clientForm.website,
										onChange: (e) => setClientForm((f) => ({
											...f,
											website: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Status",
									children: /* @__PURE__ */ jsx("select", {
										className: inputClass,
										value: clientForm.status,
										onChange: (e) => setClientForm((f) => ({
											...f,
											status: e.target.value
										})),
										children: CLIENT_STATUSES.map((s) => /* @__PURE__ */ jsx("option", { children: s }, s))
									})
								})
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Address",
							children: /* @__PURE__ */ jsx("textarea", {
								className: inputClass + " min-h-[70px]",
								value: clientForm.address,
								onChange: (e) => setClientForm((f) => ({
									...f,
									address: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Notes",
							children: /* @__PURE__ */ jsx("textarea", {
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
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "reconcile",
				onClose: () => {
					setModal(null);
					setReconcilePreview(null);
				},
				title: "Reconcile answered calls",
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => {
						setModal(null);
						setReconcilePreview(null);
					},
					children: "Close"
				}), /* @__PURE__ */ jsx(Btn, {
					onClick: () => void applyReconcile(),
					disabled: busy || !reconcilePreview || reconcilePreview.missing.length === 0 && !(reconcilePreview.directionFixes || []).length && !(reconcilePreview.extraIds || []).length,
					children: busy ? "Saving" : [reconcilePreview?.missing.length ? `Add ${reconcilePreview.missing.length}` : "", (reconcilePreview?.directionFixes || []).length ? `Update ${(reconcilePreview?.directionFixes || []).length}` : "", (reconcilePreview?.extraIds || []).length ? `Hide ${(reconcilePreview.extraIds || []).length}` : ""].filter(Boolean).join(" · ") || "Apply"
				})] }),
				children: /* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted",
							children: "Upload up to 10 Cloud Telecom CSVs. Incoming files cap inbound. Outgoing files cap outbound. Only answered calls count. Unanswered, busy, and missed are skipped. Log totals for those days match the CSV. QA, notes, and direction on existing calls are not overwritten."
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-purple-50 px-4 py-6 text-center",
							children: [
								/* @__PURE__ */ jsx(FileUp, { className: "mb-2 h-6 w-6 text-primary" }),
								/* @__PURE__ */ jsx("span", {
									className: "text-sm font-semibold",
									children: "Choose up to 10 CSVs"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-xs text-muted",
									children: "Incoming and outgoing files together. Duration updates AHT."
								}),
								/* @__PURE__ */ jsx("input", {
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
						reconcilePreview ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.missingInbound.length
											}), /* @__PURE__ */ jsx("div", {
												className: "text-muted",
												children: "Inbound missing"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.missingOutbound.length
											}), /* @__PURE__ */ jsx("div", {
												className: "text-muted",
												children: "Outbound missing"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.alreadyInbound
											}), /* @__PURE__ */ jsx("div", {
												className: "text-muted",
												children: "Inbound kept"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "rounded-lg bg-purple-50 p-2",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-lg font-bold text-primary",
												children: reconcilePreview.alreadyOutbound
											}), /* @__PURE__ */ jsx("div", {
												className: "text-muted",
												children: "Outbound kept"
											})]
										})
									]
								}),
								(reconcilePreview.directionFixes || []).length ? /* @__PURE__ */ jsxs("div", {
									className: "rounded-lg border border-primary/30 bg-purple-50 px-3 py-2 text-sm",
									children: [
										(reconcilePreview.directionFixes || []).length,
										" existing call",
										(reconcilePreview.directionFixes || []).length === 1 ? "" : "s",
										" ",
										"will update handle time only. Direction is not changed.",
										/* @__PURE__ */ jsx("div", {
											className: "mt-1 max-h-28 overflow-y-auto text-xs text-muted",
											children: (reconcilePreview.directionFixes || []).slice(0, 20).map((f) => /* @__PURE__ */ jsxs("div", { children: [
												f.phone,
												f.from !== f.to ? ` · ${f.from} → ${f.to}` : "",
												f.toDuration ? ` · ${f.fromDuration.toFixed(1)} → ${f.toDuration.toFixed(1)} min` : ""
											] }, f.callId))
										})
									]
								}) : null,
								/* @__PURE__ */ jsxs("div", {
									className: "text-xs text-muted",
									children: [
										reconcilePreview.filename,
										" · ",
										reconcilePreview.answered,
										" ",
										"answered · ",
										reconcilePreview.skipped,
										" skipped",
										(reconcilePreview.extraIds || []).length ? ` · ${(reconcilePreview.extraIds || []).length} extra will be hidden` : "",
										reconcilePreview.detectedDirection ? ` · ${reconcilePreview.detectedDirection.toLowerCase()}` : ""
									]
								}),
								reconcilePreview.missing.length === 0 && !(reconcilePreview.directionFixes || []).length ? /* @__PURE__ */ jsx("div", {
									className: "text-sm text-muted",
									children: "Every answered inbound and outbound call is already in the log."
								}) : reconcilePreview.missing.length === 0 ? /* @__PURE__ */ jsx("div", {
									className: "text-sm text-muted",
									children: "No new rows. Direction on existing calls will be updated."
								}) : /* @__PURE__ */ jsx("div", {
									className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
									children: [["Inbound", reconcilePreview.missingInbound], ["Outbound", reconcilePreview.missingOutbound]].map(([label, list]) => /* @__PURE__ */ jsxs("div", {
										className: "rounded-xl border border-border",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted",
											children: [
												label,
												" · ",
												list.length
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "max-h-48 overflow-y-auto overscroll-contain",
											children: list.length === 0 ? /* @__PURE__ */ jsx("div", {
												className: "px-3 py-4 text-xs text-muted",
												children: "None missing"
											}) : list.map((row) => /* @__PURE__ */ jsxs("div", {
												className: "border-b border-border px-3 py-2 text-sm last:border-b-0",
												children: [/* @__PURE__ */ jsx("div", {
													className: "font-semibold",
													children: row.phone
												}), /* @__PURE__ */ jsxs("div", {
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
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "export",
				onClose: () => setModal(null),
				title: "Export Data",
				children: /* @__PURE__ */ jsx("div", {
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
							"escalations",
							"Escalations (CSV)",
							"Open escalations with due date and age"
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
					].map(([key, title, desc]) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "flex items-start gap-3 rounded-xl border-2 border-border p-4 text-left transition hover:border-primary hover:bg-bg",
						onClick: () => key === "client-pdf" ? exportPdf() : exportCsv(key),
						children: [/* @__PURE__ */ jsx(Download, { className: "mt-0.5 h-5 w-5 text-primary" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-sm font-bold",
							children: title
						}), /* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted",
							children: desc
						})] })]
					}, key))
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				open: modal === "confirm" && !!confirm,
				onClose: () => {
					setModal(null);
					setConfirm(null);
				},
				title: confirm?.title || "Confirm",
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
					variant: "secondary",
					onClick: () => {
						setModal(null);
						setConfirm(null);
					},
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Btn, {
					variant: "danger",
					disabled: busy,
					onClick: () => confirm?.onConfirm(),
					children: busy ? "Working…" : "Delete"
				})] }),
				children: /* @__PURE__ */ jsx("p", {
					className: "text-center text-sm text-muted",
					children: confirm?.message
				})
			}),
			/* @__PURE__ */ jsx(ToastStack, {
				toasts,
				onDismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id))
			})
		]
	});
}
function SectionView({ children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "animate-fade-in space-y-5 md:space-y-6",
		children
	});
}
function CustomerTimeline({ customer, data, agents, clients, onBack, onEdit, onLog, onOpenCall, onOpenMessage, onMerge }) {
	if (!customer) return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(EmptyState, {
		icon: /* @__PURE__ */ jsx(UserRound, { className: "h-12 w-12" }),
		title: "Customer not found",
		description: "Go back to the list."
	}) });
	const stats = getCustomerStats(data, customer.id);
	const items = customerTimeline(data, customer.id);
	const dupes = customersSharingPhone(data.customers, customer.phone, customer.id);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-bold",
							children: customer.name
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted",
							children: [
								/* @__PURE__ */ jsx("span", { children: customer.phone || "No phone" }),
								customer.email ? /* @__PURE__ */ jsx("span", { children: customer.email }) : null,
								/* @__PURE__ */ jsx("span", { children: customerCompanyLabel(customer, clients) })
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:max-w-md",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "rounded-lg bg-purple-50 p-2",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-bold text-primary",
										children: stats.total
									}), /* @__PURE__ */ jsx("div", {
										className: "text-muted",
										children: "Calls"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "rounded-lg bg-purple-50 p-2",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-bold text-primary",
										children: stats.messages
									}), /* @__PURE__ */ jsx("div", {
										className: "text-muted",
										children: "Messages"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "rounded-lg bg-purple-50 p-2",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-bold text-primary",
										children: stats.qaScore ? formatQa(stats.qaScore) : "-"
									}), /* @__PURE__ */ jsx("div", {
										className: "text-muted",
										children: "QA"
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex shrink-0 flex-wrap gap-2",
					children: [
						/* @__PURE__ */ jsx(Btn, {
							variant: "secondary",
							onClick: onBack,
							children: "Back"
						}),
						/* @__PURE__ */ jsx(Btn, {
							variant: "secondary",
							onClick: onEdit,
							children: "Edit"
						}),
						/* @__PURE__ */ jsxs(Btn, {
							onClick: onLog,
							children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " Quick Log"]
						})
					]
				})]
			}) }),
			dupes.length > 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs("div", {
				className: "space-y-2 p-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-sm font-semibold",
					children: "Same phone number"
				}), dupes.map((d) => /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-2 text-sm",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						d.name,
						" · ",
						d.phone
					] }), /* @__PURE__ */ jsx(Btn, {
						variant: "secondary",
						onClick: () => onMerge(d.id),
						children: "Merge into this"
					})]
				}, d.id))]
			}) }) : null,
			/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { title: "Timeline" }), items.length === 0 ? /* @__PURE__ */ jsx("div", {
				className: "px-5 pb-5 text-sm text-muted",
				children: "No activity yet."
			}) : /* @__PURE__ */ jsx("div", {
				className: "divide-y divide-border",
				children: items.map((item) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "flex w-full flex-col gap-1 px-5 py-3 text-left hover:bg-purple-50/60",
					onClick: () => item.kind === "call" ? onOpenCall(item.id) : onOpenMessage(item.id),
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2 text-sm",
						children: [
							/* @__PURE__ */ jsx(Badge, {
								tone: item.kind === "call" ? "strong" : "soft",
								children: item.kind === "call" ? "Call" : "Message"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "font-semibold",
								children: item.title
							}),
							callRating(item) ? /* @__PURE__ */ jsxs("span", {
								className: "text-primary",
								children: [callRating(item), "/10"]
							}) : null,
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted",
								children: formatDate(item.datetime)
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xs text-muted",
						children: [item.detail ? `${item.detail} · ` : "", shortNotes(item.notes, 140)]
					})]
				}, item.kind + item.id))
			})] })
		]
	});
}
function Header({ title, onExport, onReconcile, primaryLabel, onPrimary }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold tracking-tight md:text-[28px]",
			children: title
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex w-full flex-wrap gap-2 sm:w-auto",
			children: [
				onExport && /* @__PURE__ */ jsxs(Btn, {
					variant: "secondary",
					className: "flex-1 sm:flex-none",
					onClick: onExport,
					children: [/* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }), " Export"]
				}),
				onReconcile && /* @__PURE__ */ jsxs(Btn, {
					variant: "secondary",
					className: "flex-1 sm:flex-none",
					onClick: onReconcile,
					children: [/* @__PURE__ */ jsx(FileUp, { className: "h-4 w-4" }), " Reconcile"]
				}),
				primaryLabel && onPrimary && /* @__PURE__ */ jsxs(Btn, {
					className: "flex-1 sm:flex-none",
					onClick: onPrimary,
					children: [
						/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
						" ",
						primaryLabel
					]
				})
			]
		})]
	});
}
function Kpi({ icon, label, value, sub, bar, accent, breakdown }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-fade-in rounded-2xl border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(167,67,255,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(167,67,255,0.1)]",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", accent ? "bg-gradient-to-br from-primary to-primary-light text-white" : "bg-purple-100 text-primary"),
				children: icon
			}),
			/* @__PURE__ */ jsx("div", {
				className: "text-[11px] font-semibold uppercase tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-1 text-[28px] font-bold leading-none",
				children: value
			}),
			sub && /* @__PURE__ */ jsx("div", {
				className: "mt-2 text-xs font-semibold text-primary",
				children: sub
			}),
			breakdown && breakdown.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "mt-3 grid gap-2 " + (breakdown.length >= 3 ? "grid-cols-3" : "grid-cols-2"),
				children: breakdown.map((row) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg bg-purple-50 px-2.5 py-2 text-center",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-base font-bold text-primary",
						children: row.value
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[10px] font-semibold uppercase tracking-wide text-muted",
						children: row.label
					})]
				}, row.label))
			}),
			typeof bar === "number" && /* @__PURE__ */ jsx("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-border",
				children: /* @__PURE__ */ jsx("div", {
					className: "h-full rounded-full bg-primary transition-all",
					style: { width: `${bar}%` }
				})
			})
		]
	});
}
function Toolbar({ children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
		children
	});
}
function escTone(bucket) {
	if (bucket === "overdue") return "outline";
	if (bucket === "today") return "strong";
	if (bucket === "aging") return "soft";
	return "default";
}
function EscalationList({ items, agents, customers, busy, onOpen, onResolve, onDue }) {
	return /* @__PURE__ */ jsx("div", {
		className: "max-h-[70vh] divide-y divide-border overflow-y-auto overscroll-contain",
		children: items.map((e) => {
			const who = contactBits(customers[e.customerId]);
			const label = e.bucket === "overdue" ? "Overdue" : e.bucket === "today" ? "Due today" : e.bucket === "aging" ? `${e.ageDays}d open` : "Open";
			return /* @__PURE__ */ jsxs("div", {
				className: "px-4 py-3 sm:px-5",
				children: [
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "w-full text-left",
						onClick: () => onOpen(e.id),
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-sm font-semibold",
										children: who.name
									}),
									who.phone ? /* @__PURE__ */ jsx("span", {
										className: "text-sm font-medium text-primary",
										children: who.phone
									}) : null,
									/* @__PURE__ */ jsx(Badge, {
										tone: escTone(e.bucket),
										children: label
									}),
									/* @__PURE__ */ jsx(Badge, {
										tone: "soft",
										children: e.type
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-1 text-xs text-muted",
								children: [
									formatDate(e.datetime),
									" · ",
									agents[e.agentId]?.name || "Unassigned",
									e.due ? ` · due ${e.due}` : " · no due date",
									e.ageDays ? ` · ${e.ageDays}d` : ""
								]
							}),
							e.notes ? /* @__PURE__ */ jsx("div", {
								className: "mt-1 text-sm text-fg",
								children: shortNotes(e.notes, 160)
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ jsx(Btn, {
								size: "sm",
								disabled: busy,
								onClick: () => onResolve(e.id),
								children: "Resolve"
							}),
							/* @__PURE__ */ jsx(Btn, {
								variant: "secondary",
								size: "sm",
								disabled: busy,
								onClick: () => onDue(e.id, todayStr()),
								children: "Due today"
							}),
							/* @__PURE__ */ jsx(Btn, {
								variant: "secondary",
								size: "sm",
								disabled: busy,
								onClick: () => onDue(e.id, dateOffsetStr(1)),
								children: "Due tomorrow"
							}),
							/* @__PURE__ */ jsx(Btn, {
								variant: "ghost",
								size: "sm",
								onClick: () => onOpen(e.id),
								children: "Edit"
							})
						]
					})
				]
			}, e.id);
		})
	});
}
function SearchBox({ value, onChange, placeholder }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative min-w-0 flex-1 sm:max-w-xs",
		children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" }), /* @__PURE__ */ jsx("input", {
			className: inputClass + " pl-9",
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder
		})]
	});
}
function RowActions({ onEdit, onDelete }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex gap-1",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: onEdit,
			className: "flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-bg",
			"aria-label": "Edit",
			children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: onDelete,
			className: "flex h-8 w-8 items-center justify-center rounded-lg text-purple-700 hover:bg-purple-50",
			"aria-label": "Delete",
			children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
		})]
	});
}
function MobileCard({ title, subtitle, rows, onEdit, onDelete }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "text-base font-bold",
				children: title
			}),
			subtitle && /* @__PURE__ */ jsx("div", {
				className: "mb-3 text-xs text-muted",
				children: subtitle
			}),
			/* @__PURE__ */ jsx("div", {
				className: "space-y-2",
				children: rows.map(([l, v]) => /* @__PURE__ */ jsxs("div", {
					className: "flex justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "shrink-0 text-xs font-semibold uppercase tracking-wide text-muted",
						children: l
					}), /* @__PURE__ */ jsx("span", {
						className: "text-right font-medium",
						children: v
					})]
				}, l))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-3 flex justify-end gap-2 border-t border-border pt-3",
				children: [/* @__PURE__ */ jsx(Btn, {
					size: "sm",
					variant: "secondary",
					onClick: onEdit,
					children: "Edit"
				}), /* @__PURE__ */ jsx(Btn, {
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
	if (!calls.length) return /* @__PURE__ */ jsx("div", {
		className: compact ? "px-1 py-3 text-center text-xs text-muted" : "px-6 py-10 text-center text-sm text-muted",
		children: compact ? "None today" : "No matching calls"
	});
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: "hidden overflow-x-auto md:block",
		children: /* @__PURE__ */ jsxs("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
				className: "bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted",
				children: [
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Time"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Agent"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Customer"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Phone"
					}),
					!compact && /* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Type"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Duration"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Outcome"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "QA"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Notes"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "Actions"
					})
				]
			}) }), /* @__PURE__ */ jsx("tbody", { children: calls.map((c) => {
				const a = agents[c.agentId];
				const cu = customers[c.customerId];
				return /* @__PURE__ */ jsxs("tr", {
					className: "border-t border-border hover:bg-purple-50/60",
					children: [
						/* @__PURE__ */ jsx("td", {
							className: "whitespace-nowrap px-4 py-3",
							children: formatDate(c.datetime)
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Avatar, { name: a?.name || "?" }), a?.name || "Unknown"]
							})
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "font-semibold",
								children: cu?.name || "Unknown"
							}), /* @__PURE__ */ jsx("div", {
								className: "text-xs font-medium text-primary",
								children: cu?.phone || "-"
							})]
						}),
						/* @__PURE__ */ jsx("td", {
							className: "whitespace-nowrap px-4 py-3 font-medium text-primary",
							children: cu?.phone || "-"
						}),
						!compact && /* @__PURE__ */ jsx("td", {
							className: "px-4 py-3",
							children: c.type
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-4 py-3",
							children: formatDuration(c.duration)
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ jsx(Badge, {
								tone: outcomeTone(c.outcome),
								children: c.outcome
							})
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ jsx(Stars, { rating: qaScore(c) })
						}),
						/* @__PURE__ */ jsx("td", {
							className: "max-w-[180px] truncate px-4 py-3 text-xs text-muted",
							title: c.notes || void 0,
							children: shortNotes(c.notes)
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ jsx(RowActions, {
								onEdit: () => onEdit(c.id),
								onDelete: () => onDelete(c.id)
							})
						})
					]
				}, c.id);
			}) })]
		})
	}), /* @__PURE__ */ jsx("div", {
		className: "space-y-3 p-4 md:hidden",
		children: calls.map((c) => {
			const a = agents[c.agentId];
			const cu = customers[c.customerId];
			return /* @__PURE__ */ jsx(MobileCard, {
				title: contactBits(cu).line,
				subtitle: formatDate(c.datetime),
				rows: [
					["Phone", cu?.phone || "-"],
					["Agent", a?.name || "Unknown"],
					["Type", c.type || "Inbound"],
					["Duration", formatDuration(c.duration)],
					["Outcome", c.outcome],
					["QA", qaScore(c) ? `${qaScore(c)}/10` : "-"],
					["Notes", shortNotes(c.notes, 80)]
				],
				onEdit: () => onEdit(c.id),
				onDelete: () => onDelete(c.id)
			}, c.id);
		})
	})] });
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
