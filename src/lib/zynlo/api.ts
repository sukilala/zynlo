/**
 * Browser-side CRM API. Talks to Firebase REST directly so the UI does not
 * wait on an extra server hop. Rules / project settings are not changed.
 */
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
import type {
  Agent,
  Call,
  Client,
  Customer,
  Message,
  ZynloData,
} from "./types";

export async function getAllData(): Promise<ZynloData> {
  return firebaseLoadAll();
}

export async function saveAgent({
  data,
}: {
  data: Parameters<typeof firebaseUpsertAgent>[0];
}): Promise<Agent> {
  return firebaseUpsertAgent(data);
}

export async function deleteAgent({ data }: { data: { id: string } }) {
  await firebaseDeleteAgent(data.id);
  return { ok: true };
}

export async function saveCustomer({
  data,
}: {
  data: Parameters<typeof firebaseUpsertCustomer>[0];
}): Promise<Customer> {
  return firebaseUpsertCustomer(data);
}

export async function deleteCustomer({ data }: { data: { id: string } }) {
  await firebaseDeleteCustomer(data.id);
  return { ok: true };
}

export async function saveClient({
  data,
}: {
  data: Parameters<typeof firebaseUpsertClient>[0];
}): Promise<Client> {
  return firebaseUpsertClient(data);
}

export async function deleteClient({ data }: { data: { id: string } }) {
  await firebaseDeleteClient(data.id);
  return { ok: true };
}

export async function saveCall({
  data,
}: {
  data: Parameters<typeof firebaseUpsertCall>[0];
}): Promise<Call> {
  return firebaseUpsertCall(data);
}

export async function deleteCall({ data }: { data: { id: string } }) {
  await firebaseDeleteCall(data.id);
  return { ok: true };
}

export async function saveMessage({
  data,
}: {
  data: Parameters<typeof firebaseUpsertMessage>[0];
}): Promise<Message> {
  return firebaseUpsertMessage(data);
}

export async function deleteMessage({ data }: { data: { id: string } }) {
  await firebaseDeleteMessage(data.id);
  return { ok: true };
}

export async function mergeCustomers({
  data,
}: {
  data: { keepId: string; dropId: string };
}) {
  await firebaseMergeCustomers(data.keepId, data.dropId);
  return { ok: true };
}
