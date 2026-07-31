import { createServerFn } from "@tanstack/react-start";
import {
  firebaseDeleteAgent,
  firebaseDeleteCall,
  firebaseDeleteClient,
  firebaseDeleteCustomer,
  firebaseDeleteMessage,
  firebaseLoadAll,
  firebaseUpsertAgent,
  firebaseUpsertCall,
  firebaseUpsertClient,
  firebaseUpsertCustomer,
  firebaseUpsertMessage,
} from "./firebase";
import type {
  Agent,
  Call,
  Client,
  Customer,
  Message,
  ZynloData,
} from "./types";

export const getAllData = createServerFn({ method: "GET" }).handler(
  async (): Promise<ZynloData> => firebaseLoadAll(),
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
    }) => d,
  )
  .handler(async ({ data }): Promise<Agent> => firebaseUpsertAgent(data));

export const deleteAgent = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
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
  .handler(async ({ data }): Promise<Customer> => firebaseUpsertCustomer(data));

export const deleteCustomer = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
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
  .handler(async ({ data }): Promise<Client> => firebaseUpsertClient(data));

export const deleteClient = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await firebaseDeleteClient(data.id);
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
  .handler(async ({ data }): Promise<Call> => firebaseUpsertCall(data));

export const deleteCall = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
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
    }) => d,
  )
  .handler(async ({ data }): Promise<Message> => firebaseUpsertMessage(data));

export const deleteMessage = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await firebaseDeleteMessage(data.id);
    return { ok: true };
  });
