import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Download,
  LayoutDashboard,
  Menu,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Users,
  UserRound,
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
  deleteAgent,
  deleteCall,
  deleteClient,
  deleteCustomer,
  getAllData,
  saveAgent,
  saveCall,
  saveClient,
  saveCustomer,
} from "@/lib/zynlo/server";
import type {
  Agent,
  Call,
  Client,
  Customer,
  ZynloData,
} from "@/lib/zynlo/types";
import {
  AGENT_ROLES,
  AGENT_STATUSES,
  CALL_TYPES,
  CLIENT_STATUSES,
  OUTCOMES,
} from "@/lib/zynlo/types";
import {
  agentMap,
  customerMap,
  downloadText,
  escapeCsv,
  formatDate,
  formatDuration,
  getAgentStats,
  getCustomerStats,
  localDatetimeValue,
  todayStr,
  yesterdayStr,
} from "@/lib/zynlo/utils";
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

type Section =
  | "dashboard"
  | "calls"
  | "agents"
  | "customers"
  | "analytics"
  | "clients";

type ModalKind =
  | null
  | "call"
  | "agent"
  | "customer"
  | "client"
  | "export"
  | "confirm";

const NAV: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> =
  [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calls", label: "Call Log", icon: ClipboardList },
    { id: "agents", label: "Agents", icon: Users },
    { id: "customers", label: "Customers", icon: UserRound },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "clients", label: "Clients", icon: Building2 },
  ];

const CHART_COLORS = [
  "#a743ff",
  "#c77dff",
  "#8a2be2",
  "#6b21a8",
  "#d4b8f5",
  "#2d1b4e",
];

const outcomeTone = (o: string) => {
  if (o === "Resolved") return "strong" as const;
  if (o === "Escalated") return "outline" as const;
  if (o === "Follow-up") return "soft" as const;
  return "default" as const;
};

export function ZynloApp({ initial }: { initial: ZynloData }) {
  const [data, setData] = useState<ZynloData>(initial);
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: string }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [callSearch, setCallSearch] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [callAgent, setCallAgent] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [clientSort, setClientSort] = useState("calls-desc");
  const [analyticsTab, setAnalyticsTab] = useState<
    "performance" | "trends" | "rank"
  >("performance");
  const [openClientCards, setOpenClientCards] = useState<
    Record<string, boolean>
  >({});
  const [exportClientStep, setExportClientStep] = useState(false);
  const [exportClientName, setExportClientName] = useState("");

  const [callForm, setCallForm] = useState({
    datetime: localDatetimeValue(),
    agentId: "",
    customerId: "",
    clientId: "",
    type: "Inbound",
    duration: "3",
    outcome: "Resolved",
    rating: "",
    notes: "",
  });
  const [agentForm, setAgentForm] = useState({
    name: "",
    email: "",
    role: "Agent",
    status: "Active",
  });
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  });
  const [clientForm, setClientForm] = useState({
    name: "",
    industry: "",
    phone: "",
    email: "",
    website: "",
    status: "Active",
    address: "",
    notes: "",
  });

  const toast = useCallback((message: string, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const next = await getAllData();
    setData(next);
    return next;
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      getAllData()
        .then(setData)
        .catch(() => undefined);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const agentsById = useMemo(() => agentMap(data), [data]);
  const customersById = useMemo(() => customerMap(data), [data]);

  const kpis = useMemo(() => {
    const today = todayStr();
    const yest = yesterdayStr();
    const todayCalls = data.calls.filter((c) => c.datetime?.startsWith(today));
    const yestCalls = data.calls.filter((c) => c.datetime?.startsWith(yest));
    const resolved = todayCalls.filter((c) => c.outcome === "Resolved").length;
    const resolution = todayCalls.length
      ? Math.round((resolved / todayCalls.length) * 100)
      : 0;
    const aht = todayCalls.length
      ? todayCalls.reduce((s, c) => s + (c.duration || 0), 0) / todayCalls.length
      : 0;
    const rated = todayCalls.filter((c) => c.rating != null);
    const csat = rated.length
      ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length
      : 0;
    const delta = todayCalls.length - yestCalls.length;
    return {
      totalToday: todayCalls.length,
      delta,
      resolution,
      aht,
      csat,
    };
  }, [data.calls]);

  const hourData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      calls: 0,
    }));
    for (const c of data.calls) {
      if (!c.datetime) continue;
      const h = new Date(c.datetime).getHours();
      if (!isNaN(h)) hours[h].calls += 1;
    }
    return hours;
  }, [data.calls]);

  const outcomeData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of data.calls) {
      if (c.outcome) map[c.outcome] = (map[c.outcome] || 0) + 1;
    }
    const entries = Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
    return entries.length ? entries : [{ name: "No Data", value: 0 }];
  }, [data.calls]);

  const dailyVolume = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      days.push({
        label: d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
        }),
        calls: data.calls.filter((c) => c.datetime?.startsWith(str)).length,
      });
    }
    return days;
  }, [data.calls]);

  const ahtTrend = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      const dayCalls = data.calls.filter((c) => c.datetime?.startsWith(str));
      const avg = dayCalls.length
        ? dayCalls.reduce((s, c) => s + (c.duration || 0), 0) / dayCalls.length
        : 0;
      days.push({
        label: d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        avg: Number(avg.toFixed(1)),
      });
    }
    return days;
  }, [data.calls]);

  const agentRankings = useMemo(() => {
    return data.agents
      .map((a) => {
        const stats = getAgentStats(data, a.id);
        const score = stats.total
          ? Math.round(
              stats.resolutionRate * 40 +
                stats.csat * 20 +
                Math.min(stats.total, 50) -
                stats.avgDuration * 2,
            )
          : 0;
        return { agent: a, ...stats, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [data]);

  const filteredCalls = useMemo(() => {
    let list = [...data.calls];
    const q = callSearch.toLowerCase().trim();
    if (q) {
      list = list.filter((c) => {
        const a = agentsById[c.agentId];
        const cu = customersById[c.customerId];
        return (
          a?.name.toLowerCase().includes(q) ||
          cu?.name.toLowerCase().includes(q) ||
          cu?.phone?.includes(q)
        );
      });
    }
    if (callOutcome) list = list.filter((c) => c.outcome === callOutcome);
    if (callAgent) list = list.filter((c) => c.agentId === callAgent);
    list.sort(
      (a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );
    return list;
  }, [data.calls, callSearch, callOutcome, callAgent, agentsById, customersById]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return data.customers;
    return data.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q),
    );
  }, [data.customers, customerSearch]);

  const clientCards = useMemo(() => {
    const byName: Record<
      string,
      {
        client: Client | null;
        name: string;
        contacts: Customer[];
        calls: Call[];
      }
    > = {};
    for (const cl of data.clients) {
      byName[cl.name] = { client: cl, name: cl.name, contacts: [], calls: [] };
    }
    for (const cu of data.customers) {
      const key = cu.company || cu.name;
      if (!byName[key]) {
        byName[key] = { client: null, name: key, contacts: [], calls: [] };
      }
      byName[key].contacts.push(cu);
    }
    for (const call of data.calls) {
      const cl = call.clientId
        ? data.clients.find((c) => c.id === call.clientId)
        : null;
      const cu = customersById[call.customerId];
      const key = cl?.name || cu?.company || cu?.name || "Unknown";
      if (!byName[key]) {
        byName[key] = {
          client: cl || null,
          name: key,
          contacts: [],
          calls: [],
        };
      }
      byName[key].calls.push(call);
    }
    let list = Object.values(byName);
    const q = clientSearch.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.contacts.some((x) => x.name.toLowerCase().includes(q)),
      );
    }
    list.sort((a, b) => {
      if (clientSort === "calls-asc") return a.calls.length - b.calls.length;
      if (clientSort === "name-asc") return a.name.localeCompare(b.name);
      if (clientSort === "name-desc") return b.name.localeCompare(a.name);
      if (clientSort === "last-contact") {
        const la = a.calls[0]?.datetime || "";
        const lb = b.calls[0]?.datetime || "";
        return lb.localeCompare(la);
      }
      return b.calls.length - a.calls.length;
    });
    return list;
  }, [data, clientSearch, clientSort, customersById]);

  function openModal(kind: ModalKind, id?: string) {
    setEditId(id || null);
    setExportClientStep(false);
    if (kind === "call") {
      if (id) {
        const c = data.calls.find((x) => x.id === id);
        if (c) {
          setCallForm({
            datetime: c.datetime.slice(0, 16),
            agentId: c.agentId,
            customerId: c.customerId,
            clientId: c.clientId || "",
            type: c.type,
            duration: String(c.duration),
            outcome: c.outcome,
            rating: c.rating != null ? String(c.rating) : "",
            notes: c.notes || "",
          });
        }
      } else {
        setCallForm({
          datetime: localDatetimeValue(),
          agentId: data.agents[0]?.id || "",
          customerId: data.customers[0]?.id || "",
          clientId: data.clients[0]?.id || "",
          type: "Inbound",
          duration: "3",
          outcome: "Resolved",
          rating: "",
          notes: "",
        });
      }
    }
    if (kind === "agent") {
      if (id) {
        const a = data.agents.find((x) => x.id === id);
        if (a)
          setAgentForm({
            name: a.name,
            email: a.email,
            role: a.role,
            status: a.status,
          });
      } else {
        setAgentForm({ name: "", email: "", role: "Agent", status: "Active" });
      }
    }
    if (kind === "customer") {
      if (id) {
        const c = data.customers.find((x) => x.id === id);
        if (c)
          setCustomerForm({
            name: c.name,
            phone: c.phone,
            email: c.email,
            company: c.company,
            notes: c.notes,
          });
      } else {
        setCustomerForm({
          name: "",
          phone: "",
          email: "",
          company: "",
          notes: "",
        });
      }
    }
    if (kind === "client") {
      if (id) {
        const c = data.clients.find((x) => x.id === id);
        if (c)
          setClientForm({
            name: c.name,
            industry: c.industry,
            phone: c.phone,
            email: c.email,
            website: c.website,
            status: c.status,
            address: c.address,
            notes: c.notes,
          });
      } else {
        setClientForm({
          name: "",
          industry: "",
          phone: "",
          email: "",
          website: "",
          status: "Active",
          address: "",
          notes: "",
        });
      }
    }
    setModal(kind);
  }

  async function onSaveCall(e: React.FormEvent) {
    e.preventDefault();
    if (!callForm.agentId || !callForm.customerId) {
      toast("Add an agent and customer first");
      return;
    }
    setBusy(true);
    try {
      await saveCall({
        data: {
          id: editId || undefined,
          datetime: callForm.datetime,
          agentId: callForm.agentId,
          customerId: callForm.customerId,
          clientId: callForm.clientId || null,
          type: callForm.type,
          duration: parseFloat(callForm.duration) || 0,
          outcome: callForm.outcome,
          rating: callForm.rating ? parseInt(callForm.rating, 10) : null,
          notes: callForm.notes,
        },
      });
      await refresh();
      setModal(null);
      toast(editId ? "Call updated" : "Call logged");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save call");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveAgent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveAgent({
        data: {
          id: editId || undefined,
          name: agentForm.name,
          email: agentForm.email,
          role: agentForm.role,
          status: agentForm.status,
        },
      });
      await refresh();
      setModal(null);
      toast(editId ? "Agent updated" : "Agent added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save agent");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveCustomer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveCustomer({
        data: {
          id: editId || undefined,
          name: customerForm.name,
          phone: customerForm.phone,
          email: customerForm.email,
          company: customerForm.company,
          notes: customerForm.notes,
        },
      });
      await refresh();
      setModal(null);
      toast(editId ? "Customer updated" : "Customer added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveClient(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveClient({
        data: {
          id: editId || undefined,
          name: clientForm.name,
          industry: clientForm.industry,
          phone: clientForm.phone,
          email: clientForm.email,
          website: clientForm.website,
          status: clientForm.status,
          address: clientForm.address,
          notes: clientForm.notes,
        },
      });
      await refresh();
      setModal(null);
      toast(editId ? "Client updated" : "Client added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save client");
    } finally {
      setBusy(false);
    }
  }

  function askDelete(
    title: string,
    message: string,
    action: () => Promise<void>,
  ) {
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
      },
    });
    setModal("confirm");
  }

  function exportCsv(type: string) {
    const date = new Date().toISOString().split("T")[0];
    if (type === "calls") {
      const header =
        "Datetime,Agent,Customer,Type,Duration,Outcome,Rating,Notes\n";
      const rows = data.calls
        .map((c) =>
          [
            c.datetime,
            agentsById[c.agentId]?.name || "",
            customersById[c.customerId]?.name || "",
            c.type,
            c.duration,
            c.outcome,
            c.rating ?? "",
            c.notes,
          ]
            .map(escapeCsv)
            .join(","),
        )
        .join("\n");
      downloadText(header + rows, `zynlo_calls_${date}.csv`, "text/csv");
    } else if (type === "agents") {
      const header =
        "Name,Email,Role,Status,Total Calls,Resolution %,Avg Duration,QA Score\n";
      const rows = data.agents
        .map((a) => {
          const s = getAgentStats(data, a.id);
          return [
            a.name,
            a.email,
            a.role,
            a.status,
            s.total,
            Math.round(s.resolutionRate * 100),
            s.avgDuration.toFixed(1),
            s.csat ? s.csat.toFixed(1) : "",
          ]
            .map(escapeCsv)
            .join(",");
        })
        .join("\n");
      downloadText(header + rows, `zynlo_agents_${date}.csv`, "text/csv");
    } else if (type === "customers") {
      const header =
        "Name,Phone,Email,Company,Total Calls,Last Contact,Notes\n";
      const rows = data.customers
        .map((c) => {
          const s = getCustomerStats(data, c.id);
          return [
            c.name,
            c.phone,
            c.email,
            c.company,
            s.total,
            s.lastCall ? formatDate(s.lastCall.datetime) : "",
            c.notes,
          ]
            .map(escapeCsv)
            .join(",");
        })
        .join("\n");
      downloadText(header + rows, `zynlo_customers_${date}.csv`, "text/csv");
    } else if (type === "json") {
      downloadText(
        JSON.stringify(data, null, 2),
        `zynlo_backup_${date}.json`,
        "application/json",
      );
    } else if (type === "clients") {
      const header =
        "Company,Contact Name,Phone,Email,Total Calls,Resolved,Escalated,Avg Duration,QA Score,Last Contact,Notes\n";
      const rows: string[] = [];
      for (const card of clientCards) {
        if (exportClientName && card.name !== exportClientName) continue;
        const contacts =
          card.contacts.length > 0
            ? card.contacts
            : [
                {
                  id: "",
                  name: "—",
                  phone: "",
                  email: "",
                  company: card.name,
                  notes: "",
                },
              ];
        for (const contact of contacts) {
          const related = data.calls.filter(
            (c) =>
              c.customerId === contact.id ||
              (card.client && c.clientId === card.client.id),
          );
          const resolved = related.filter((c) => c.outcome === "Resolved")
            .length;
          const escalated = related.filter((c) => c.outcome === "Escalated")
            .length;
          const avg = related.length
            ? related.reduce((s, c) => s + c.duration, 0) / related.length
            : 0;
          const rated = related.filter((c) => c.rating != null);
          const qa = rated.length
            ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length
            : 0;
          const last = related.sort(
            (a, b) =>
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
          )[0];
          rows.push(
            [
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
              contact.notes,
            ]
              .map(escapeCsv)
              .join(","),
          );
        }
      }
      if (!rows.length) {
        toast("No client data to export");
        return;
      }
      downloadText(
        header + rows.join("\n"),
        `zynlo_clients_${exportClientName ? exportClientName.replace(/\\s+/g, "_") : "all"}_${date}.csv`,
        "text/csv",
      );
    }
    toast("Export ready");
    setModal(null);
  }

  const go = (id: Section) => {
    setSection(id);
    setSidebarOpen(false);
  };

  const recent = data.calls
    .slice()
    .sort(
      (a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <button
        type="button"
        className="fixed left-4 top-4 z-[200] flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.3)] md:hidden"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed z-[100] flex h-full w-[260px] flex-col overflow-y-auto bg-gradient-to-b from-sidebar to-sidebar-2 px-4 py-6 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-8 flex items-center px-2 pt-1">
          <img
            src="/logo-wordmark.png"
            alt="ZYNLO"
            className="h-8 w-auto max-w-[180px] object-contain object-left md:h-9"
          />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.3)]"
                    : "text-white/60 hover:bg-primary/15 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-4 pt-16 md:ml-[260px] md:px-8 md:py-6 md:pt-6">
        {section === "dashboard" && (
          <SectionView>
            <Header
              title="Dashboard"
              onExport={() => openModal("export")}
              primaryLabel="Log Call"
              onPrimary={() => openModal("call")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi
                icon={<Phone className="h-5 w-5" />}
                label="Total Calls Today"
                value={String(kpis.totalToday)}
                sub={`${kpis.delta >= 0 ? "+" : ""}${kpis.delta} vs yesterday`}
              />
              <Kpi
                icon={<BarChart3 className="h-5 w-5" />}
                label="Resolution Rate"
                value={`${kpis.resolution}%`}
                bar={kpis.resolution}
              />
              <Kpi
                icon={<ClipboardList className="h-5 w-5" />}
                label="Avg Handle Time"
                value={formatDuration(kpis.aht)}
                sub="Target: under 5m"
              />
              <Kpi
                icon={<Star className="h-5 w-5" />}
                label="Quality Assurance"
                value={kpis.csat ? kpis.csat.toFixed(1) : "0.0"}
                sub="/ 5.0"
                accent
              />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title="Calls by Hour" />
                <div className="h-[260px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(167,67,255,0.08)"
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10 }}
                        interval={3}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="calls"
                        fill="#a743ff"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Call Outcomes" />
                <div className="h-[260px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {outcomeData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <Card>
              <CardHeader
                title="Recent Calls"
                action={
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => go("calls")}
                  >
                    View All
                  </Btn>
                }
              />
              <CallsTable
                calls={recent}
                agents={agentsById}
                customers={customersById}
                onEdit={(id) => openModal("call", id)}
                onDelete={(id) =>
                  askDelete("Delete Call?", "This call will be removed.", () =>
                    deleteCall({ data: { id } }).then(() => undefined),
                  )
                }
                compact
              />
            </Card>
          </SectionView>
        )}

        {section === "calls" && (
          <SectionView>
            <Header
              title="Call Log"
              onExport={() => openModal("export")}
              primaryLabel="Log Call"
              onPrimary={() => openModal("call")}
            />
            <Toolbar>
              <SearchBox
                value={callSearch}
                onChange={setCallSearch}
                placeholder="Search calls..."
              />
              <select
                className={inputClass + " w-auto min-w-[140px]"}
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
              >
                <option value="">All Outcomes</option>
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                className={inputClass + " w-auto min-w-[140px]"}
                value={callAgent}
                onChange={(e) => setCallAgent(e.target.value)}
              >
                <option value="">All Agents</option>
                {data.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Toolbar>
            <Card>
              {data.calls.length === 0 ? (
                <EmptyState
                  icon={<Phone className="h-12 w-12" />}
                  title="No calls yet"
                  description="Log your first call to start tracking."
                />
              ) : (
                <CallsTable
                  calls={filteredCalls}
                  agents={agentsById}
                  customers={customersById}
                  onEdit={(id) => openModal("call", id)}
                  onDelete={(id) =>
                    askDelete(
                      "Delete Call?",
                      "This call will be removed.",
                      () =>
                        deleteCall({ data: { id } }).then(() => undefined),
                    )
                  }
                />
              )}
            </Card>
          </SectionView>
        )}

        {section === "agents" && (
          <SectionView>
            <Header
              title="Agents"
              onExport={() => openModal("export")}
              primaryLabel="Add Agent"
              onPrimary={() => openModal("agent")}
            />
            <Card>
              {data.agents.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-12 w-12" />}
                  title="No agents yet"
                  description="Add agents who handle customer calls."
                />
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <th className="px-4 py-3">Agent</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Calls</th>
                          <th className="px-4 py-3">Avg Time</th>
                          <th className="px-4 py-3">Resolution</th>
                          <th className="px-4 py-3">QA</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.agents.map((a) => {
                          const s = getAgentStats(data, a.id);
                          const rate = s.total
                            ? Math.round(s.resolutionRate * 100)
                            : 0;
                          return (
                            <tr
                              key={a.id}
                              className="border-t border-border hover:bg-purple-50/60"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Avatar name={a.name} />
                                  <div>
                                    <div className="font-semibold">{a.name}</div>
                                    <div className="text-xs text-muted">
                                      {a.email || "—"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{a.role}</td>
                              <td className="px-4 py-3 font-semibold">
                                {s.total}
                              </td>
                              <td className="px-4 py-3">
                                {formatDuration(s.avgDuration)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{rate}%</span>
                                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${rate}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {s.csat ? (
                                  <span className="text-primary">
                                    ★ {s.csat.toFixed(1)}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  tone={
                                    a.status === "Active" ? "strong" : "soft"
                                  }
                                >
                                  {a.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <RowActions
                                  onEdit={() => openModal("agent", a.id)}
                                  onDelete={() =>
                                    askDelete(
                                      "Delete Agent?",
                                      "This agent and their calls will be removed.",
                                      () =>
                                        deleteAgent({
                                          data: { id: a.id },
                                        }).then(() => undefined),
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-3 p-4 md:hidden">
                    {data.agents.map((a) => {
                      const s = getAgentStats(data, a.id);
                      const rate = s.total
                        ? Math.round(s.resolutionRate * 100)
                        : 0;
                      return (
                        <MobileCard
                          key={a.id}
                          title={a.name}
                          subtitle={`${a.role} · ${a.status}`}
                          rows={[
                            ["Calls", String(s.total)],
                            ["Avg Time", formatDuration(s.avgDuration)],
                            ["Resolution", `${rate}%`],
                            ["QA", s.csat ? s.csat.toFixed(1) : "—"],
                          ]}
                          onEdit={() => openModal("agent", a.id)}
                          onDelete={() =>
                            askDelete(
                              "Delete Agent?",
                              "This agent and their calls will be removed.",
                              () =>
                                deleteAgent({ data: { id: a.id } }).then(
                                  () => undefined,
                                ),
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </SectionView>
        )}

        {section === "customers" && (
          <SectionView>
            <Header
              title="Customers"
              onExport={() => openModal("export")}
              primaryLabel="Add Customer"
              onPrimary={() => openModal("customer")}
            />
            <Toolbar>
              <SearchBox
                value={customerSearch}
                onChange={setCustomerSearch}
                placeholder="Search customers..."
              />
            </Toolbar>
            <Card>
              {data.customers.length === 0 ? (
                <EmptyState
                  icon={<UserRound className="h-12 w-12" />}
                  title="No customers yet"
                  description="Add customers to track interaction history."
                />
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Company</th>
                          <th className="px-4 py-3">Calls</th>
                          <th className="px-4 py-3">Last Contact</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((c) => {
                          const s = getCustomerStats(data, c.id);
                          return (
                            <tr
                              key={c.id}
                              className="border-t border-border hover:bg-purple-50/60"
                            >
                              <td className="px-4 py-3 font-semibold">
                                {c.name}
                              </td>
                              <td className="px-4 py-3">{c.phone}</td>
                              <td className="px-4 py-3">{c.email || "—"}</td>
                              <td className="px-4 py-3">{c.company || "—"}</td>
                              <td className="px-4 py-3 font-semibold">
                                {s.total}
                              </td>
                              <td className="px-4 py-3">
                                {s.lastCall
                                  ? formatDate(s.lastCall.datetime)
                                  : "Never"}
                              </td>
                              <td className="px-4 py-3">
                                <RowActions
                                  onEdit={() => openModal("customer", c.id)}
                                  onDelete={() =>
                                    askDelete(
                                      "Delete Customer?",
                                      "This customer and their calls will be removed.",
                                      () =>
                                        deleteCustomer({
                                          data: { id: c.id },
                                        }).then(() => undefined),
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-3 p-4 md:hidden">
                    {filteredCustomers.map((c) => {
                      const s = getCustomerStats(data, c.id);
                      return (
                        <MobileCard
                          key={c.id}
                          title={c.name}
                          subtitle={c.phone}
                          rows={[
                            ["Email", c.email || "—"],
                            ["Company", c.company || "—"],
                            ["Calls", String(s.total)],
                            [
                              "Last",
                              s.lastCall
                                ? formatDate(s.lastCall.datetime)
                                : "Never",
                            ],
                          ]}
                          onEdit={() => openModal("customer", c.id)}
                          onDelete={() =>
                            askDelete(
                              "Delete Customer?",
                              "This customer and their calls will be removed.",
                              () =>
                                deleteCustomer({ data: { id: c.id } }).then(
                                  () => undefined,
                                ),
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </SectionView>
        )}

        {section === "analytics" && (
          <SectionView>
            <Header title="Analytics" onExport={() => openModal("export")} />
            <div className="flex gap-1 overflow-x-auto border-b border-border">
              {(
                [
                  ["performance", "Performance"],
                  ["trends", "Trends"],
                  ["rank", "Agent Rankings"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAnalyticsTab(id)}
                  className={cn(
                    "shrink-0 border-b-2 px-5 py-2.5 text-sm font-semibold transition",
                    analyticsTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-primary",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {analyticsTab === "performance" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Daily Call Volume (Last 7 Days)" />
                  <div className="h-[280px] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyVolume}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(167,67,255,0.08)"
                        />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke="#a743ff"
                          strokeWidth={2}
                          dot={{ fill: "#a743ff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Outcome Breakdown" />
                  <div className="h-[280px] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={outcomeData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={100}
                        >
                          {outcomeData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}
            {analyticsTab === "trends" && (
              <Card>
                <CardHeader title="Average Handle Time Trend" />
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ahtTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(167,67,255,0.08)"
                      />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name="Avg mins"
                        stroke="#8a2be2"
                        strokeWidth={2}
                        dot={{ fill: "#8a2be2" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
            {analyticsTab === "rank" && (
              <Card>
                <CardHeader title="Top Performing Agents" />
                {agentRankings.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-12 w-12" />}
                    title="No data yet"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Agent</th>
                          <th className="px-4 py-3">Calls</th>
                          <th className="px-4 py-3">Resolution</th>
                          <th className="px-4 py-3">Avg Time</th>
                          <th className="px-4 py-3">QA</th>
                          <th className="px-4 py-3">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentRankings.map((r, i) => (
                          <tr
                            key={r.agent.id}
                            className="border-t border-border"
                          >
                            <td className="px-4 py-3 text-lg font-bold text-primary">
                              #{i + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar name={r.agent.name} />
                                {r.agent.name}
                              </div>
                            </td>
                            <td className="px-4 py-3">{r.total}</td>
                            <td className="px-4 py-3">
                              {Math.round(r.resolutionRate * 100)}%
                            </td>
                            <td className="px-4 py-3">
                              {formatDuration(r.avgDuration)}
                            </td>
                            <td className="px-4 py-3">
                              {r.csat ? r.csat.toFixed(1) : "—"}
                            </td>
                            <td className="px-4 py-3 font-bold">{r.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </SectionView>
        )}

        {section === "clients" && (
          <SectionView>
            <Header
              title="Clients"
              onExport={() => openModal("export")}
              primaryLabel="Add Client"
              onPrimary={() => openModal("client")}
            />
            <Toolbar>
              <SearchBox
                value={clientSearch}
                onChange={setClientSearch}
                placeholder="Search clients..."
              />
              <select
                className={inputClass + " w-auto min-w-[160px]"}
                value={clientSort}
                onChange={(e) => setClientSort(e.target.value)}
              >
                <option value="calls-desc">Most Calls</option>
                <option value="calls-asc">Least Calls</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="last-contact">Last Contact</option>
              </select>
            </Toolbar>
            {clientCards.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Building2 className="h-12 w-12" />}
                  title="No clients yet"
                  description="Add clients to group contacts and track accounts."
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {clientCards.map((card) => {
                  const open = openClientCards[card.name];
                  const resolved = card.calls.filter(
                    (c) => c.outcome === "Resolved",
                  ).length;
                  const avg = card.calls.length
                    ? card.calls.reduce((s, c) => s + c.duration, 0) /
                      card.calls.length
                    : 0;
                  return (
                    <div
                      key={card.name}
                      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_8px_rgba(167,67,255,0.06)]"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 bg-purple-50 px-5 py-4 text-left hover:bg-purple-100"
                        onClick={() =>
                          setOpenClientCards((m) => ({
                            ...m,
                            [card.name]: !m[card.name],
                          }))
                        }
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-lg font-bold">
                            {card.name}
                            {card.client && (
                              <Badge
                                tone={
                                  card.client.status === "Active"
                                    ? "strong"
                                    : "soft"
                                }
                              >
                                {card.client.status}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            {card.contacts.length} contacts ·{" "}
                            {card.calls.length} calls
                            {card.client?.industry
                              ? ` · ${card.client.industry}`
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.client && (
                            <Btn
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("client", card.client!.id);
                              }}
                            >
                              Edit
                            </Btn>
                          )}
                          <span
                            className={cn(
                              "text-primary transition-transform",
                              open && "rotate-180",
                            )}
                          >
                            ▾
                          </span>
                        </div>
                      </button>
                      {open && (
                        <div className="space-y-4 px-5 py-5">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MiniKpi
                              label="Calls"
                              value={String(card.calls.length)}
                            />
                            <MiniKpi
                              label="Resolved"
                              value={String(resolved)}
                            />
                            <MiniKpi
                              label="Avg Duration"
                              value={formatDuration(avg)}
                            />
                            <MiniKpi
                              label="Contacts"
                              value={String(card.contacts.length)}
                            />
                          </div>
                          {card.contacts.length > 0 && (
                            <div>
                              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                Contacts
                              </h4>
                              <div className="space-y-2">
                                {card.contacts.map((c) => (
                                  <div
                                    key={c.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2 text-sm"
                                  >
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-muted">{c.phone}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {card.client && (
                            <div className="flex justify-end">
                              <Btn
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  askDelete(
                                    "Delete Client?",
                                    "This client record will be removed.",
                                    () =>
                                      deleteClient({
                                        data: { id: card.client!.id },
                                      }).then(() => undefined),
                                  )
                                }
                              >
                                Delete Client
                              </Btn>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionView>
        )}
      </main>

      <Modal
        open={modal === "call"}
        onClose={() => setModal(null)}
        title={editId ? "Edit Call" : "Log New Call"}
        wide
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn type="submit" form="call-form" disabled={busy}>
              {busy ? "Saving…" : "Save Call"}
            </Btn>
          </>
        }
      >
        <form id="call-form" onSubmit={onSaveCall} className="space-y-4">
          {(!data.agents.length || !data.customers.length) && (
            <div className="rounded-[10px] border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800">
              Add at least one agent and one customer before logging a call.
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date & Time *">
              <input
                type="datetime-local"
                required
                className={inputClass}
                value={callForm.datetime}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, datetime: e.target.value }))
                }
              />
            </Field>
            <Field label="Agent *">
              <select
                required
                className={inputClass}
                value={callForm.agentId}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, agentId: e.target.value }))
                }
              >
                <option value="">Select agent</option>
                {data.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer *">
              <select
                required
                className={inputClass}
                value={callForm.customerId}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, customerId: e.target.value }))
                }
              >
                <option value="">Select customer</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Client">
              <select
                className={inputClass}
                value={callForm.clientId}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, clientId: e.target.value }))
                }
              >
                <option value="">None</option>
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select
                className={inputClass}
                value={callForm.type}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {CALL_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration (mins) *">
              <input
                type="number"
                min={0}
                step={0.1}
                required
                className={inputClass}
                value={callForm.duration}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, duration: e.target.value }))
                }
              />
            </Field>
            <Field label="Outcome *">
              <select
                required
                className={inputClass}
                value={callForm.outcome}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, outcome: e.target.value }))
                }
              >
                {OUTCOMES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="QA Rating (1–5)">
              <input
                type="number"
                min={1}
                max={5}
                step={1}
                className={inputClass}
                value={callForm.rating}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, rating: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              className={inputClass + " min-h-[80px] resize-y"}
              value={callForm.notes}
              onChange={(e) =>
                setCallForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Call summary, action items…"
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={modal === "agent"}
        onClose={() => setModal(null)}
        title={editId ? "Edit Agent" : "Add Agent"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn type="submit" form="agent-form" disabled={busy}>
              {busy ? "Saving…" : "Save Agent"}
            </Btn>
          </>
        }
      >
        <form
          id="agent-form"
          onSubmit={onSaveAgent}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field label="Full Name *">
            <input
              required
              className={inputClass}
              value={agentForm.name}
              onChange={(e) =>
                setAgentForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={agentForm.email}
              onChange={(e) =>
                setAgentForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Role">
            <select
              className={inputClass}
              value={agentForm.role}
              onChange={(e) =>
                setAgentForm((f) => ({ ...f, role: e.target.value }))
              }
            >
              {AGENT_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={agentForm.status}
              onChange={(e) =>
                setAgentForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              {AGENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </form>
      </Modal>

      <Modal
        open={modal === "customer"}
        onClose={() => setModal(null)}
        title={editId ? "Edit Customer" : "Add Customer"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn type="submit" form="customer-form" disabled={busy}>
              {busy ? "Saving…" : "Save Customer"}
            </Btn>
          </>
        }
      >
        <form
          id="customer-form"
          onSubmit={onSaveCustomer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field label="Name *">
            <input
              required
              className={inputClass}
              value={customerForm.name}
              onChange={(e) =>
                setCustomerForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </Field>
          <Field label="Phone *">
            <input
              required
              type="tel"
              className={inputClass}
              value={customerForm.phone}
              onChange={(e) =>
                setCustomerForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={customerForm.email}
              onChange={(e) =>
                setCustomerForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Company">
            <input
              className={inputClass}
              value={customerForm.company}
              onChange={(e) =>
                setCustomerForm((f) => ({ ...f, company: e.target.value }))
              }
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea
              className={inputClass + " min-h-[70px]"}
              value={customerForm.notes}
              onChange={(e) =>
                setCustomerForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={modal === "client"}
        onClose={() => setModal(null)}
        title={editId ? "Edit Client" : "Add Client"}
        wide
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn type="submit" form="client-form" disabled={busy}>
              {busy ? "Saving…" : "Save Client"}
            </Btn>
          </>
        }
      >
        <form id="client-form" onSubmit={onSaveClient} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company Name *">
              <input
                required
                className={inputClass}
                value={clientForm.name}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Industry">
              <input
                className={inputClass}
                value={clientForm.industry}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, industry: e.target.value }))
                }
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                className={inputClass}
                value={clientForm.phone}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                className={inputClass}
                value={clientForm.website}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, website: e.target.value }))
                }
              />
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={clientForm.status}
                onChange={(e) =>
                  setClientForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {CLIENT_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Address">
            <textarea
              className={inputClass + " min-h-[70px]"}
              value={clientForm.address}
              onChange={(e) =>
                setClientForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </Field>
          <Field label="Notes">
            <textarea
              className={inputClass + " min-h-[70px]"}
              value={clientForm.notes}
              onChange={(e) =>
                setClientForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={modal === "export"}
        onClose={() => setModal(null)}
        title="Export Data"
      >
        {!exportClientStep ? (
          <div className="grid gap-3">
            {[
              ["calls", "Calls (CSV)", "All call records"],
              ["agents", "Agents (CSV)", "Agents with performance stats"],
              ["customers", "Customers (CSV)", "Customers with call counts"],
              [
                "clients-step",
                "Clients by Company (CSV)",
                "Select a client or all",
              ],
              ["json", "Full Backup (JSON)", "Everything as JSON"],
            ].map(([key, title, desc]) => (
              <button
                key={key}
                type="button"
                className="flex items-start gap-3 rounded-xl border-2 border-border p-4 text-left transition hover:border-primary hover:bg-bg"
                onClick={() => {
                  if (key === "clients-step") setExportClientStep(true);
                  else exportCsv(key);
                }}
              >
                <Download className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-bold">{title}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Client">
              <select
                className={inputClass}
                value={exportClientName}
                onChange={(e) => setExportClientName(e.target.value)}
              >
                <option value="">All Clients</option>
                {clientCards.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.calls.length} calls)
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2">
              <Btn
                variant="secondary"
                onClick={() => setExportClientStep(false)}
              >
                Back
              </Btn>
              <Btn onClick={() => exportCsv("clients")}>Export CSV</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modal === "confirm" && !!confirm}
        onClose={() => {
          setModal(null);
          setConfirm(null);
        }}
        title={confirm?.title || "Confirm"}
        footer={
          <>
            <Btn
              variant="secondary"
              onClick={() => {
                setModal(null);
                setConfirm(null);
              }}
            >
              Cancel
            </Btn>
            <Btn
              variant="danger"
              disabled={busy}
              onClick={() => confirm?.onConfirm()}
            >
              {busy ? "Working…" : "Delete"}
            </Btn>
          </>
        }
      >
        <p className="text-center text-sm text-muted">{confirm?.message}</p>
      </Modal>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />
    </div>
  );
}

function SectionView({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in space-y-5 md:space-y-6">{children}</div>;
}

function Header({
  title,
  onExport,
  primaryLabel,
  onPrimary,
}: {
  title: string;
  onExport?: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">
        {title}
      </h1>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {onExport && (
          <Btn
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={onExport}
          >
            <Download className="h-4 w-4" /> Export
          </Btn>
        )}
        {primaryLabel && onPrimary && (
          <Btn className="flex-1 sm:flex-none" onClick={onPrimary}>
            <Plus className="h-4 w-4" /> {primaryLabel}
          </Btn>
        )}
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  bar,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  bar?: number;
  accent?: boolean;
}) {
  return (
    <div className="animate-fade-in rounded-2xl border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(167,67,255,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(167,67,255,0.1)]">
      <div
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-xl",
          accent
            ? "bg-gradient-to-br from-primary to-primary-light text-white"
            : "bg-purple-100 text-primary",
        )}
      >
        {icon}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-[28px] font-bold leading-none">{value}</div>
      {sub && (
        <div className="mt-2 text-xs font-semibold text-primary">{sub}</div>
      )}
      {typeof bar === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        className={inputClass + " pl-9"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-bg"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-purple-700 hover:bg-purple-50"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function MobileCard({
  title,
  subtitle,
  rows,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  rows: Array<[string, string]>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="text-base font-bold">{title}</div>
      {subtitle && <div className="mb-3 text-xs text-muted">{subtitle}</div>}
      <div className="space-y-2">
        {rows.map(([l, v]) => (
          <div key={l} className="flex justify-between text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {l}
            </span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
        <Btn size="sm" variant="secondary" onClick={onEdit}>
          Edit
        </Btn>
        <Btn size="sm" variant="danger" onClick={onDelete}>
          Delete
        </Btn>
      </div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function CallsTable({
  calls,
  agents,
  customers,
  onEdit,
  onDelete,
  compact,
}: {
  calls: Call[];
  agents: Record<string, Agent>;
  customers: Record<string, Customer>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}) {
  if (!calls.length) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted">
        No matching calls
      </div>
    );
  }
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Customer</th>
              {!compact && <th className="px-4 py-3">Type</th>}
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">QA</th>
              {!compact && <th className="px-4 py-3">Notes</th>}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => {
              const a = agents[c.agentId];
              const cu = customers[c.customerId];
              return (
                <tr
                  key={c.id}
                  className="border-t border-border hover:bg-purple-50/60"
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDate(c.datetime)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={a?.name || "?"} />
                      {a?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-3">{cu?.name || "Unknown"}</td>
                  {!compact && <td className="px-4 py-3">{c.type}</td>}
                  <td className="px-4 py-3">{formatDuration(c.duration)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={outcomeTone(c.outcome)}>{c.outcome}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Stars rating={c.rating} />
                  </td>
                  {!compact && (
                    <td className="max-w-[180px] truncate px-4 py-3 text-xs text-muted">
                      {c.notes || "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => onEdit(c.id)}
                      onDelete={() => onDelete(c.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 p-4 md:hidden">
        {calls.map((c) => {
          const a = agents[c.agentId];
          const cu = customers[c.customerId];
          return (
            <MobileCard
              key={c.id}
              title={cu?.name || "Unknown"}
              subtitle={formatDate(c.datetime)}
              rows={[
                ["Agent", a?.name || "Unknown"],
                ["Duration", formatDuration(c.duration)],
                ["Outcome", c.outcome],
                ["QA", c.rating ? `${c.rating}/5` : "—"],
              ]}
              onEdit={() => onEdit(c.id)}
              onDelete={() => onDelete(c.id)}
            />
          );
        })}
      </div>
    </>
  );
}
