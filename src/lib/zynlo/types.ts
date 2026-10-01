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
  /** SHA-256 of pepper|id|password. Never shown in the UI. */
  passwordHash?: string;
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
  /** Section scores, each /10. Total is the weighted rating. */
  qa?: QaParts | null;
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

export type QaKey =
  | "greeting"
  | "communication"
  | "compliance"
  | "resolution"
  | "closing";

export type QaParts = Record<QaKey, number>;

export const QA_PARTS: { key: QaKey; label: string; weight: number; guide: string }[] = [
  { key: "greeting", label: "Greeting and Opening", weight: 0.1, guide: "A 10 names themselves, confirms who they are speaking to, and says why they called." },
  { key: "communication", label: "Communication and Soft Skills", weight: 0.2, guide: "A 10 is clear and calm, lets the customer finish, and does not make them repeat." },
  { key: "compliance", label: "Compliance and Process Adherence", weight: 0.25, guide: "A 10 follows every required step and verifies the account. Nothing mandatory is skipped." },
  { key: "resolution", label: "Resolution and Accuracy", weight: 0.3, guide: "A 10 gives the correct answer and the issue is closed before the call ends." },
  { key: "closing", label: "Call Closing", weight: 0.15, guide: "A 10 recaps what was done, checks the customer is satisfied, then says goodbye." },
];

export const OUTCOMES: CallOutcome[] = [
  "Resolved",
  "Escalated",
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
