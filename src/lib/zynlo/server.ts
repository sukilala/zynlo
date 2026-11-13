import { createMiddleware, createServerFn } from "@tanstack/react-start";
import {
  firebaseDeleteAgent,
  firebaseDeleteCall,
  firebaseDeleteClient,
  firebaseDeleteCustomer,
  firebaseDeleteMessage,
  firebaseLoadAll,
  firebaseMergeCustomers,
  firebaseUpsertAgent,
  firebaseUpsertCall,
  firebaseUpsertClient,
  firebaseUpsertCustomer,
  firebaseUpsertMessage,
} from "./firebase";
import { toClientError } from "./client-error";
import type { Agent, Call, Client, Customer, Message, ZynloData } from "./types";
import {
  idInput,
  mergeInput,
  parseInput,
  saveAgentInput,
  saveCallInput,
  saveClientInput,
  saveCustomerInput,
  saveMessageInput,
} from "./validate";

function hideAgent(agent: Agent): Agent {
  const copy = { ...agent };
  delete copy.passwordHash;
  return copy;
}

function hideSecrets(data: ZynloData): ZynloData {
  return { ...data, agents: data.agents.map(hideAgent) };
}

const crmFn = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    return next({ headers: { "x-zynlo-request": "crm" } });
  })
  .server(async ({ next }) => {
    const { assertAppRequest } = await import("./request-guard.server");
    assertAppRequest();
    try {
      return await next();
    } catch (err) {
      throw toClientError(err);
    }
  });

async function requireAgent() {
  const { requireAccessAgent } = await import("./identity.server");
  return requireAccessAgent();
}

export const whoAmI = createServerFn({ method: "GET" })
  .middleware([crmFn])
  .handler(async () => {
    const agent = await requireAgent();
    return { agentId: agent.id, email: agent.email, name: agent.name };
  });

export const getAllData = createServerFn({ method: "GET" })
  .middleware([crmFn])
  .handler(async (): Promise<ZynloData> => {
    await requireAgent();
    return hideSecrets(await firebaseLoadAll());
  });

export const saveAgent = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(saveAgentInput, data))
  .handler(async ({ data }): Promise<Agent> => {
    await requireAgent();
    const saved = await firebaseUpsertAgent(data);
    return hideAgent(saved);
  });

export const deleteAgent = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(idInput, data))
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteAgent(data.id);
    return { ok: true };
  });

export const saveCustomer = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(saveCustomerInput, data))
  .handler(async ({ data }): Promise<Customer> => {
    await requireAgent();
    return firebaseUpsertCustomer(data);
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(idInput, data))
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteCustomer(data.id);
    return { ok: true };
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(saveClientInput, data))
  .handler(async ({ data }): Promise<Client> => {
    await requireAgent();
    return firebaseUpsertClient(data);
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(idInput, data))
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteClient(data.id);
    return { ok: true };
  });

export const saveCall = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(saveCallInput, data))
  .handler(async ({ data }): Promise<Call> => {
    await requireAgent();
    return firebaseUpsertCall(data);
  });

export const deleteCall = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(idInput, data))
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteCall(data.id);
    return { ok: true };
  });

export const saveMessage = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(saveMessageInput, data))
  .handler(async ({ data }): Promise<Message> => {
    await requireAgent();
    return firebaseUpsertMessage({ ...data, agentId: data.agentId || "" });
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(idInput, data))
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseDeleteMessage(data.id);
    return { ok: true };
  });

export const mergeCustomers = createServerFn({ method: "POST" })
  .middleware([crmFn])
  .validator((data: unknown) => parseInput(mergeInput, data))
  .handler(async ({ data }) => {
    await requireAgent();
    await firebaseMergeCustomers(data.keepId, data.dropId);
    return { ok: true };
  });
