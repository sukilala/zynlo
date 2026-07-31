export type AgentStatus = "Active" | "Away" | "Offline" | "On Break";
export type ClientStatus = "Active" | "Inactive" | "Prospect";
export type CallType = "Inbound" | "Outbound" | "Callback";
export type CallOutcome =
  | "Resolved"
  | "Escalated"
  | "Follow-up"
  | "No Answer"
  | "Voicemail";

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AgentStatus;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  status: ClientStatus;
  address: string;
  notes: string;
}

export interface Call {
  id: string;
  datetime: string;
  agentId: string;
  customerId: string;
  clientId: string | null;
  type: CallType;
  duration: number;
  outcome: CallOutcome;
  rating: number | null;
  notes: string;
}

export interface ZynloData {
  agents: Agent[];
  customers: Customer[];
  clients: Client[];
  calls: Call[];
}

export const OUTCOMES: CallOutcome[] = [
  "Resolved",
  "Escalated",
  "Follow-up",
  "No Answer",
  "Voicemail",
];

export const CALL_TYPES: CallType[] = ["Inbound", "Outbound", "Callback"];
export const AGENT_ROLES = ["Agent", "Senior Agent", "Team Lead", "Supervisor"];
export const AGENT_STATUSES: AgentStatus[] = [
  "Active",
  "Away",
  "Offline",
  "On Break",
];
export const CLIENT_STATUSES: ClientStatus[] = [
  "Active",
  "Inactive",
  "Prospect",
];
