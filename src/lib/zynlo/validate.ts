import { z } from "zod";
import { ClientSafeError } from "./client-error";
import { isSafeRecordId } from "./ids";

const recordId = z.string().refine(isSafeRecordId, "Invalid record id");
const optionalId = z
  .string()
  .max(80)
  .refine((value) => value === "" || isSafeRecordId(value), "Invalid record id")
  .optional();
const linkId = z.union([optionalId, z.null()]).optional();
const short = (max: number) => z.string().max(max);
const longText = (max: number) => z.string().max(max);

const qaScore = z.number().finite().min(1).max(10);

export const saveAgentInput = z.object({
  id: recordId.optional(),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(320).optional(),
  role: short(40).optional(),
  status: short(40).optional(),
});

export const saveCustomerInput = z.object({
  id: recordId.optional(),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(80),
  email: z.string().trim().max(320).optional(),
  company: short(200).optional(),
  clientId: linkId,
  notes: longText(100_000).optional(),
});

export const saveClientInput = z.object({
  id: recordId.optional(),
  name: z.string().trim().min(1).max(200),
  industry: short(120).optional(),
  phone: short(80).optional(),
  email: z.string().trim().max(320).optional(),
  website: short(300).optional(),
  status: short(40).optional(),
  address: short(300).optional(),
  notes: longText(100_000).optional(),
});

export const saveCallInput = z.object({
  id: recordId.optional(),
  datetime: z.string().min(4).max(64),
  agentId: optionalId,
  customerId: recordId,
  clientId: linkId,
  type: short(40).optional(),
  duration: z.number().finite().min(0).max(1_000_000),
  outcome: z.string().min(1).max(40),
  rating: z.number().finite().min(0).max(10).nullable().optional(),
  ratingScale: z.union([z.literal(5), z.literal(10)]).optional(),
  notes: longText(100_000).optional(),
  followUpAt: z.union([z.string().max(40), z.null()]).optional(),
  source: z.enum(["manual", "telecom"]).optional(),
  csvCounted: z.boolean().optional(),
  qa: z
    .object({
      greeting: qaScore,
      communication: qaScore,
      compliance: qaScore,
      resolution: qaScore,
      closing: qaScore,
    })
    .nullable()
    .optional(),
});

export const saveMessageInput = z.object({
  id: recordId.optional(),
  datetime: z.string().min(4).max(64),
  agentId: optionalId,
  customerId: recordId,
  clientId: linkId,
  channel: short(40).optional(),
  direction: short(40).optional(),
  subject: short(300).optional(),
  body: z.string().max(100_000),
  status: short(40).optional(),
  notes: longText(100_000).optional(),
  followUpAt: z.union([z.string().max(40), z.null()]).optional(),
});

export const idInput = z.object({ id: recordId });
export const mergeInput = z.object({ keepId: recordId, dropId: recordId });

export function parseInput<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new ClientSafeError("Check the form and try again.");
  return result.data;
}
