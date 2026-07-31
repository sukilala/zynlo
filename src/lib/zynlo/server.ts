import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type {
  Agent,
  AgentStatus,
  Call,
  CallOutcome,
  CallType,
  Client,
  ClientStatus,
  Customer,
  ZynloData,
} from "./types";

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

type AgentRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};
type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
};
type ClientRow = {
  id: string;
  name: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  status: string;
  address: string;
  notes: string;
};
type CallRow = {
  id: string;
  datetime: string;
  agent_id: string;
  customer_id: string;
  client_id: string | null;
  type: string;
  duration: number;
  outcome: string;
  rating: number | null;
  notes: string;
};

function mapAgent(r: AgentRow): Agent {
  return {
    id: r.id,
    name: r.name,
    email: r.email || "",
    role: r.role || "Agent",
    status: (r.status || "Active") as AgentStatus,
  };
}
function mapCustomer(r: CustomerRow): Customer {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone || "",
    email: r.email || "",
    company: r.company || "",
    notes: r.notes || "",
  };
}
function mapClient(r: ClientRow): Client {
  return {
    id: r.id,
    name: r.name,
    industry: r.industry || "",
    phone: r.phone || "",
    email: r.email || "",
    website: r.website || "",
    status: (r.status || "Active") as ClientStatus,
    address: r.address || "",
    notes: r.notes || "",
  };
}
function mapCall(r: CallRow): Call {
  return {
    id: r.id,
    datetime: r.datetime,
    agentId: r.agent_id,
    customerId: r.customer_id,
    clientId: r.client_id,
    type: (r.type || "Inbound") as CallType,
    duration: Number(r.duration) || 0,
    outcome: (r.outcome || "Resolved") as CallOutcome,
    rating: r.rating == null ? null : Number(r.rating),
    notes: r.notes || "",
  };
}

export const getAllData = createServerFn({ method: "GET" }).handler(
  async (): Promise<ZynloData> => {
    const sql = await getSql();
    const [agents, customers, clients, calls] = await Promise.all([
      sql<AgentRow>`select id, name, email, role, status from zynlo_agents order by name`,
      sql<CustomerRow>`select id, name, phone, email, company, notes from zynlo_customers order by name`,
      sql<ClientRow>`select id, name, industry, phone, email, website, status, address, notes from zynlo_clients order by name`,
      sql<CallRow>`select id, datetime, agent_id, customer_id, client_id, type, duration, outcome, rating, notes from zynlo_calls order by datetime desc`,
    ]);
    return {
      agents: agents.map(mapAgent),
      customers: customers.map(mapCustomer),
      clients: clients.map(mapClient),
      calls: calls.map(mapCall),
    };
  },
);

export const saveAgent = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      name: string;
      email?: string;
      role?: string;
      status?: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<Agent> => {
    const sql = await getSql();
    const id = data.id || uid();
    const name = data.name.trim();
    if (!name) throw new Error("Name is required");
    const email = (data.email || "").trim();
    const role = data.role || "Agent";
    const status = data.status || "Active";
    await sql`
      insert into zynlo_agents (id, name, email, role, status)
      values (${id}, ${name}, ${email}, ${role}, ${status})
      on conflict (id) do update set
        name = excluded.name,
        email = excluded.email,
        role = excluded.role,
        status = excluded.status
    `;
    return { id, name, email, role, status: status as AgentStatus };
  });

export const deleteAgent = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from zynlo_agents where id = ${data.id}`;
    return { ok: true };
  });

export const saveCustomer = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      name: string;
      phone: string;
      email?: string;
      company?: string;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<Customer> => {
    const sql = await getSql();
    const id = data.id || uid();
    const name = data.name.trim();
    const phone = data.phone.trim();
    if (!name || !phone) throw new Error("Name and phone are required");
    const email = (data.email || "").trim();
    const company = (data.company || "").trim();
    const notes = (data.notes || "").trim();
    await sql`
      insert into zynlo_customers (id, name, phone, email, company, notes)
      values (${id}, ${name}, ${phone}, ${email}, ${company}, ${notes})
      on conflict (id) do update set
        name = excluded.name,
        phone = excluded.phone,
        email = excluded.email,
        company = excluded.company,
        notes = excluded.notes
    `;
    return { id, name, phone, email, company, notes };
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from zynlo_customers where id = ${data.id}`;
    return { ok: true };
  });

export const saveClient = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      name: string;
      industry?: string;
      phone?: string;
      email?: string;
      website?: string;
      status?: string;
      address?: string;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<Client> => {
    const sql = await getSql();
    const id = data.id || uid();
    const name = data.name.trim();
    if (!name) throw new Error("Company name is required");
    const industry = (data.industry || "").trim();
    const phone = (data.phone || "").trim();
    const email = (data.email || "").trim();
    const website = (data.website || "").trim();
    const status = data.status || "Active";
    const address = (data.address || "").trim();
    const notes = (data.notes || "").trim();
    await sql`
      insert into zynlo_clients (id, name, industry, phone, email, website, status, address, notes)
      values (${id}, ${name}, ${industry}, ${phone}, ${email}, ${website}, ${status}, ${address}, ${notes})
      on conflict (id) do update set
        name = excluded.name,
        industry = excluded.industry,
        phone = excluded.phone,
        email = excluded.email,
        website = excluded.website,
        status = excluded.status,
        address = excluded.address,
        notes = excluded.notes
    `;
    return {
      id,
      name,
      industry,
      phone,
      email,
      website,
      status: status as ClientStatus,
      address,
      notes,
    };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from zynlo_clients where id = ${data.id}`;
    return { ok: true };
  });

export const saveCall = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      datetime: string;
      agentId: string;
      customerId: string;
      clientId?: string | null;
      type?: string;
      duration: number;
      outcome: string;
      rating?: number | null;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<Call> => {
    const sql = await getSql();
    const id = data.id || uid();
    if (!data.datetime || !data.agentId || !data.customerId) {
      throw new Error("Datetime, agent, and customer are required");
    }
    const clientId = data.clientId || null;
    const type = data.type || "Inbound";
    const duration = Number(data.duration) || 0;
    const outcome = data.outcome || "Resolved";
    const rating =
      data.rating == null || data.rating === ("" as unknown)
        ? null
        : Number(data.rating);
    const notes = (data.notes || "").trim();
    await sql`
      insert into zynlo_calls (id, datetime, agent_id, customer_id, client_id, type, duration, outcome, rating, notes)
      values (${id}, ${data.datetime}, ${data.agentId}, ${data.customerId}, ${clientId}, ${type}, ${duration}, ${outcome}, ${rating}, ${notes})
      on conflict (id) do update set
        datetime = excluded.datetime,
        agent_id = excluded.agent_id,
        customer_id = excluded.customer_id,
        client_id = excluded.client_id,
        type = excluded.type,
        duration = excluded.duration,
        outcome = excluded.outcome,
        rating = excluded.rating,
        notes = excluded.notes
    `;
    return {
      id,
      datetime: data.datetime,
      agentId: data.agentId,
      customerId: data.customerId,
      clientId,
      type: type as CallType,
      duration,
      outcome: outcome as CallOutcome,
      rating,
      notes,
    };
  });

export const deleteCall = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from zynlo_calls where id = ${data.id}`;
    return { ok: true };
  });
