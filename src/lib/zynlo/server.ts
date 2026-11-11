import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";
import {
  firebaseDeleteAgent,
  firebaseDeleteCall,
  firebaseDeleteClient,
  firebaseDeleteCustomer,
  firebaseDeleteMessage,
  firebaseListAgents,
  firebaseLoadAll,
  firebaseMergeCustomers,
  firebaseUpsertAgent,
  firebaseUpsertCall,
  firebaseUpsertClient,
  firebaseUpsertCustomer,
  firebaseUpsertMessage,
} from "./firebase";
import type { Agent, Call, Client, Customer, Message, ZynloData } from "./types";

const COOKIE = "zynlo_gate";
const MAX_AGE = 60 * 60 * 24 * 180;

function hideAgent(agent: Agent): Agent {
  const copy = { ...agent };
  delete copy.passwordHash;
  return copy;
}

function hideSecrets(data: ZynloData): ZynloData {
  return { ...data, agents: data.agents.map(hideAgent) };
}

async function seal(agentId: string) {
  const { sealAgentSession } = await import("./firebase-token.server");
  const exp = Date.now() + MAX_AGE * 1000;
  setCookie(COOKIE, sealAgentSession(agentId, exp), {
    httpOnly: true,
    secure: getRequestProtocol() === "https",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

async function requireAgent() {
  const { openAgentSession } = await import("./firebase-token.server");
  const agentId = openAgentSession(getCookie(COOKIE));
  if (!agentId) throw new Error("Sign in required");
  return agentId;
}

export const whoAmI = createServerFn({ method: "GET" }).handler(async () => {
  const { openAgentSession } = await import("./firebase-token.server");
  return { agentId: openAgentSession(getCookie(COOKIE)) };
});

export const listAgentNames = createServerFn({ method: "GET" }).handler(
  async () => {
    const agents = await firebaseListAgents();
    return agents.map((a) => ({
      id: a.id,
      name: a.name,
      email: "",
      role: a.role,
      status: a.status,
    }));
  },
);

export const signInAgent = createServerFn({ method: "POST" })
  .validator((d: { agentId: string; password: string }) => d)
  .handler(async ({ data }) => {
    const { hashAgentPassword } = await import("./session");
    const proof = await hashAgentPassword(data.agentId, data.password || "");
    const agents = await firebaseListAgents();
    const agent = agents.find((a) => a.id === data.agentId);
    if (!agent?.passwordHash || agent.passwordHash !== proof) {
      throw new Error("Wrong password");
    }
    await seal(agent.id);
    return { agentId: agent.id };
  });

export const resumeSession = createServerFn({ method: "POST" })
  .validator((d: { agentId: string; proof: string }) => d)
  .handler(async ({ data }) => {
    if (!/^[a-f0-9]{64}$/.test(data.proof || "")) {
      throw new Error("Sign in required");
    }
    const agents = await firebaseListAgents();
    const agent = agents.find((a) => a.id === data.agentId);
    if (!agent?.passwordHash || agent.passwordHash !== data.proof) {
      throw new Error("Sign in required");
    }
    await seal(agent.id);
    return { agentId: agent.id };
  });

export const signOutAgent = createServerFn({ method: "POST" }).handler(
  async () => {
    deleteCookie(COOKIE, { path: "/" });
    return { ok: true };
  },
);

export const getAllData = createServerFn({ method: "GET" }).handler(
  async (): Promise<ZynloData> => {
    await requireAgent();
    return hideSecrets(await firebaseLoadAll());
  },
);

export const getStorageMode = createServerFn({ method: "GET" }).handler(
  async () => ({
    source: "firebase" as const,
    cloud: true,
    label: "Firebase Realtime Database (shared)",
  }),
);

export const saveAgent = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      name: string;
      email?: string;
      role?: string;
      status?: string;
      password?: string;
      passwordHash?: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<Agent> => {
    await requireAgent();
    let passwordHash = data.passwordHash;
    if (data.password?.trim()) {
      const { hashAgentPassword } = await import("./session");
      const id = data.id || "";
      passwordHash = await hashAgentPassword(id, data.password);
    }
    const saved = await firebaseUpsertAgent({ ...data, passwordHash });
    return hideAgent(saved);
  });

export const deleteAgent = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteAgent(data.id);
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
      clientId?: string | null;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<Customer> => {
    await requireAgent();
    return firebaseUpsertCustomer(data);
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteCustomer(data.id);
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
    await requireAgent();
    return firebaseUpsertClient(data);
  });

export const deleteClient = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteClient(data.id);
    return { ok: true };
  });

export const saveCall = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      datetime: string;
      agentId?: string;
      customerId: string;
      clientId?: string | null;
      type?: string;
      duration: number;
      outcome: string;
      rating?: number | null;
      ratingScale?: 5 | 10;
      notes?: string;
      followUpAt?: string | null;
      source?: "manual" | "telecom";
      csvCounted?: boolean;
      qa?: Call["qa"];
    }) => d,
  )
  .handler(async ({ data }): Promise<Call> => {
    await requireAgent();
    return firebaseUpsertCall(data);
  });

export const deleteCall = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteCall(data.id);
    return { ok: true };
  });

export const saveMessage = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id?: string;
      datetime: string;
      agentId: string;
      customerId: string;
      clientId?: string | null;
      channel?: string;
      direction?: string;
      subject?: string;
      body: string;
      status?: string;
      notes?: string;
      followUpAt?: string | null;
    }) => d,
  )
  .handler(async ({ data }): Promise<Message> => {
    await requireAgent();
    return firebaseUpsertMessage(data);
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteMessage(data.id);
    return { ok: true };
  });

export const mergeCustomers = createServerFn({ method: "POST" })
  .validator((d: { keepId: string; dropId: string }) => d)
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseMergeCustomers(data.keepId, data.dropId);
    return { ok: true };
  });
