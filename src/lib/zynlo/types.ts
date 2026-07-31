export type AgentStatus = "Active" | "Away" | "Offline" | "On Break";
export type ClientStatus = "Active" | "Inactive" | "Prospect";
export type CallType = "Inbound" | "Outbound" | "Callback";
export type CallOutcome =
  | "Resolved"
  | "Escalated"
  | "Follow-up"
  | "No Answer"
  | "Voicemail";

/** Message channels for non-voice conversations */
export type MessageChannel =
  | "SMS"
  | "WhatsApp"
  | "Email"
  | "Chat"
  | "Social";
export type MessageDirection = "Inbound" | "Outbound";
export type MessageStatus = "Open" | "Pending" | "Replied" | "Closed";

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AgentStatus;
}

/**
 * Customer = individual person / contact who reaches out.
 * Optionally linked to a Client (company account) via clientId.
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Free-text company label when not linked to a Client record */
  company: string;
  /** Optional link to a Client (B2B company account) */
  clientId: string | null;
  notes: string;
}

/**
 * Client = company / account entity (B2B).
 * Distinct from Customer (person). Has its own contacts via customers.clientId.
 */
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

/** Logged SMS / chat / email conversation touchpoint */
export interface Message {
  id: string;
  datetime: string;
  agentId: string;
  customerId: string;
  clientId: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  subject: string;
  body: string;
  status: MessageStatus;
  notes: string;
}

export interface ZynloData {
  agents: Agent[];
  customers: Customer[];
  clients: Client[];
  calls: Call[];
  messages: Message[];
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
export const MESSAGE_CHANNELS: MessageChannel[] = [
  "SMS",
  "WhatsApp",
  "Email",
  "Chat",
  "Social",
];
export const MESSAGE_DIRECTIONS: MessageDirection[] = ["Inbound", "Outbound"];
export const MESSAGE_STATUSES: MessageStatus[] = [
  "Open",
  "Pending",
  "Replied",
  "Closed",
];
