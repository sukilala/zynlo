-- Link individual customers to company clients; log message-based conversations

alter table zynlo_customers
  add column if not exists client_id text references zynlo_clients(id) on delete set null;

create index if not exists zynlo_customers_client_idx on zynlo_customers (client_id);

create table if not exists zynlo_messages (
  id          text primary key,
  datetime    text not null,
  agent_id    text not null references zynlo_agents(id) on delete cascade,
  customer_id text not null references zynlo_customers(id) on delete cascade,
  client_id   text references zynlo_clients(id) on delete set null,
  channel     text not null default 'SMS',
  direction   text not null default 'Inbound',
  subject     text not null default '',
  body        text not null default '',
  status      text not null default 'Open',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists zynlo_messages_datetime_idx on zynlo_messages (datetime desc);
create index if not exists zynlo_messages_agent_idx on zynlo_messages (agent_id);
create index if not exists zynlo_messages_customer_idx on zynlo_messages (customer_id);
create index if not exists zynlo_messages_client_idx on zynlo_messages (client_id);
