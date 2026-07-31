-- Zynlo call-center CRM schema (shared team data, not per-user)

create table if not exists zynlo_agents (
  id         text primary key,
  name       text not null,
  email      text not null default '',
  role       text not null default 'Agent',
  status     text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists zynlo_customers (
  id         text primary key,
  name       text not null,
  phone      text not null default '',
  email      text not null default '',
  company    text not null default '',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists zynlo_clients (
  id         text primary key,
  name       text not null,
  industry   text not null default '',
  phone      text not null default '',
  email      text not null default '',
  website    text not null default '',
  status     text not null default 'Active',
  address    text not null default '',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists zynlo_calls (
  id          text primary key,
  datetime    text not null,
  agent_id    text not null references zynlo_agents(id) on delete cascade,
  customer_id text not null references zynlo_customers(id) on delete cascade,
  client_id   text references zynlo_clients(id) on delete set null,
  type        text not null default 'Inbound',
  duration    double precision not null default 0,
  outcome     text not null default 'Resolved',
  rating      integer,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists zynlo_calls_datetime_idx on zynlo_calls (datetime desc);
create index if not exists zynlo_calls_agent_idx on zynlo_calls (agent_id);
create index if not exists zynlo_calls_customer_idx on zynlo_calls (customer_id);
create index if not exists zynlo_calls_client_idx on zynlo_calls (client_id);
