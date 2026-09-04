export type AgentStatus = "Active" | "Away" | "Offline" | "On Break";
export type ClientStatus = "Active" | "Inactive" | "Prospect";
export type CallType = "Inbound" | "Outbound" | "Callback";
export type CallOutcome =
  | "Resolved"
  | "Escalated"
  | "Follow-up"
  | "No Answer"
  | "Voicemail"
  | "Answered";

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
  /** 5 = legacy. 10 = current QA. Missing + rating <= 5 is treated as /5. */
  ratingScale?: 5 | 10;
  notes: string;
  followUpAt: string | null;
  /** manual = agent log. telecom = file reconcile. Never overwrite manual. */
  source?: "manual" | "telecom";
  /** false = extra over the CSV cap. Stays in Firebase, off every total. */
  csvCounted?: boolean;
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
  followUpAt: string | null;
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
  "Answered",
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
