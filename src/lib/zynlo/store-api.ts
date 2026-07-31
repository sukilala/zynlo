/**
 * Shared CRUD helpers used by Vite REST middleware (downloadable HTML client).
 * React app uses createServerFn instead.
 */
import { getSql } from "@/lib/db";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export async function loadAll() {
  const sql = await getSql();
  const [agents, customers, clients, calls, messages] = await Promise.all([
    sql`select id, name, email, role, status from zynlo_agents order by name`,
    sql`select id, name, phone, email, company, client_id as "clientId", notes from zynlo_customers order by name`,
    sql`select id, name, industry, phone, email, website, status, address, notes from zynlo_clients order by name`,
    sql`select id, datetime, agent_id as "agentId", customer_id as "customerId", client_id as "clientId", type, duration, outcome, rating, notes from zynlo_calls order by datetime desc`,
    sql`select id, datetime, agent_id as "agentId", customer_id as "customerId", client_id as "clientId", channel, direction, subject, body, status, notes from zynlo_messages order by datetime desc`,
  ]);
  return { agents, customers, clients, calls, messages };
}

export async function upsertAgent(body: Record<string, unknown>) {
  const sql = await getSql();
  const id = String(body.id || uid());
  const name = String(body.name || "").trim();
  if (!name) throw new Error("Name required");
  const email = String(body.email || "");
  const role = String(body.role || "Agent");
  const status = String(body.status || "Active");
  await sql`
    insert into zynlo_agents (id, name, email, role, status)
    values (${id}, ${name}, ${email}, ${role}, ${status})
    on conflict (id) do update set name=excluded.name, email=excluded.email, role=excluded.role, status=excluded.status
  `;
  return { id, name, email, role, status };
}

export async function removeAgent(id: string) {
  const sql = await getSql();
  await sql`delete from zynlo_agents where id = ${id}`;
}

export async function upsertCustomer(body: Record<string, unknown>) {
  const sql = await getSql();
  const id = String(body.id || uid());
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!name || !phone) throw new Error("Name and phone required");
  const email = String(body.email || "");
  const company = String(body.company || "");
  const clientId = body.clientId ? String(body.clientId) : null;
  const notes = String(body.notes || "");
  await sql`
    insert into zynlo_customers (id, name, phone, email, company, client_id, notes)
    values (${id}, ${name}, ${phone}, ${email}, ${company}, ${clientId}, ${notes})
    on conflict (id) do update set name=excluded.name, phone=excluded.phone, email=excluded.email, company=excluded.company, client_id=excluded.client_id, notes=excluded.notes
  `;
  return { id, name, phone, email, company, clientId, notes };
}

export async function removeCustomer(id: string) {
  const sql = await getSql();
  await sql`delete from zynlo_customers where id = ${id}`;
}

export async function upsertClient(body: Record<string, unknown>) {
  const sql = await getSql();
  const id = String(body.id || uid());
  const name = String(body.name || "").trim();
  if (!name) throw new Error("Name required");
  const industry = String(body.industry || "");
  const phone = String(body.phone || "");
  const email = String(body.email || "");
  const website = String(body.website || "");
  const status = String(body.status || "Active");
  const address = String(body.address || "");
  const notes = String(body.notes || "");
  await sql`
    insert into zynlo_clients (id, name, industry, phone, email, website, status, address, notes)
    values (${id}, ${name}, ${industry}, ${phone}, ${email}, ${website}, ${status}, ${address}, ${notes})
    on conflict (id) do update set name=excluded.name, industry=excluded.industry, phone=excluded.phone, email=excluded.email, website=excluded.website, status=excluded.status, address=excluded.address, notes=excluded.notes
  `;
  return { id, name, industry, phone, email, website, status, address, notes };
}

export async function removeClient(id: string) {
  const sql = await getSql();
  await sql`delete from zynlo_clients where id = ${id}`;
}

export async function upsertCall(body: Record<string, unknown>) {
  const sql = await getSql();
  const id = String(body.id || uid());
  const datetime = String(body.datetime || "");
  const agentId = String(body.agentId || "");
  const customerId = String(body.customerId || "");
  if (!datetime || !agentId || !customerId) throw new Error("Missing fields");
  const clientId = body.clientId ? String(body.clientId) : null;
  const type = String(body.type || "Inbound");
  const duration = Number(body.duration) || 0;
  const outcome = String(body.outcome || "Resolved");
  const rating =
    body.rating == null || body.rating === "" ? null : Number(body.rating);
  const notes = String(body.notes || "");
  await sql`
    insert into zynlo_calls (id, datetime, agent_id, customer_id, client_id, type, duration, outcome, rating, notes)
    values (${id}, ${datetime}, ${agentId}, ${customerId}, ${clientId}, ${type}, ${duration}, ${outcome}, ${rating}, ${notes})
    on conflict (id) do update set datetime=excluded.datetime, agent_id=excluded.agent_id, customer_id=excluded.customer_id, client_id=excluded.client_id, type=excluded.type, duration=excluded.duration, outcome=excluded.outcome, rating=excluded.rating, notes=excluded.notes
  `;
  return {
    id,
    datetime,
    agentId,
    customerId,
    clientId,
    type,
    duration,
    outcome,
    rating,
    notes,
  };
}

export async function removeCall(id: string) {
  const sql = await getSql();
  await sql`delete from zynlo_calls where id = ${id}`;
}

export async function upsertMessage(body: Record<string, unknown>) {
  const sql = await getSql();
  const id = String(body.id || uid());
  const datetime = String(body.datetime || "");
  const agentId = String(body.agentId || "");
  const customerId = String(body.customerId || "");
  const bodyText = String(body.body || "").trim();
  if (!datetime || !agentId || !customerId || !bodyText) {
    throw new Error("Datetime, agent, customer, and body required");
  }
  const clientId = body.clientId ? String(body.clientId) : null;
  const channel = String(body.channel || "SMS");
  const direction = String(body.direction || "Inbound");
  const subject = String(body.subject || "");
  const status = String(body.status || "Open");
  const notes = String(body.notes || "");
  await sql`
    insert into zynlo_messages (id, datetime, agent_id, customer_id, client_id, channel, direction, subject, body, status, notes)
    values (${id}, ${datetime}, ${agentId}, ${customerId}, ${clientId}, ${channel}, ${direction}, ${subject}, ${bodyText}, ${status}, ${notes})
    on conflict (id) do update set datetime=excluded.datetime, agent_id=excluded.agent_id, customer_id=excluded.customer_id, client_id=excluded.client_id, channel=excluded.channel, direction=excluded.direction, subject=excluded.subject, body=excluded.body, status=excluded.status, notes=excluded.notes
  `;
  return {
    id,
    datetime,
    agentId,
    customerId,
    clientId,
    channel,
    direction,
    subject,
    body: bodyText,
    status,
    notes,
  };
}

export async function removeMessage(id: string) {
  const sql = await getSql();
  await sql`delete from zynlo_messages where id = ${id}`;
}
