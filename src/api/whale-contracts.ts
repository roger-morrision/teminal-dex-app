import { z } from "zod";

const publicKey = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const cursor = z.object({ beforeObservedAt: z.number().int().positive().safe(), beforeId: z.string().min(8).max(128) }).strict();
const event = z.object({
  id: z.string().min(8).max(128), tokenAddress: publicKey, wallet: publicKey.nullable(), direction: z.enum(["buy", "sell"]),
  amountUsd: z.number().finite().nonnegative().nullable(), observedAt: z.number().int().positive().safe(), source: z.string().min(1).max(120),
  sourceIdentity: z.string().min(1).max(180), dataQuality: z.enum(["observed", "partial", "provider_reported"]),
}).strict();

export const whaleHistorySchema = z.object({
  schema: z.literal("whale-history-v1"), ownerScoped: z.boolean(), events: z.array(event).max(50), hasMore: z.boolean(), nextCursor: cursor.nullable(),
  retentionDays: z.number().int().positive().max(3_650), generatedAt: z.number().int().positive().safe(), executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const ids = value.events.map((row) => row.id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "Whale event IDs must be unique.", path: ["events"] });
  value.events.forEach((row, index, rows) => { const previous = rows[index - 1]; if (previous && (previous.observedAt < row.observedAt || (previous.observedAt === row.observedAt && previous.id <= row.id))) context.addIssue({ code: "custom", message: "Whale history must use strict descending observed-time/ID order.", path: ["events", index] }); });
  if (value.hasMore !== Boolean(value.nextCursor)) context.addIssue({ code: "custom", message: "Whale cursor availability mismatch.", path: ["nextCursor"] });
  const last = value.events.at(-1); if (value.nextCursor && (!last || last.observedAt !== value.nextCursor.beforeObservedAt || last.id !== value.nextCursor.beforeId)) context.addIssue({ code: "custom", message: "Whale cursor must match the page boundary.", path: ["nextCursor"] });
});

export const walletClassificationHistorySchema = z.object({
  schema: z.literal("wallet-classification-history-v1"), wallet: publicKey, generatedAt: z.number().int().positive().safe(),
  versions: z.array(z.object({ id: z.string().min(8).max(128), version: z.number().int().positive(), label: z.enum(["whale", "smart_money", "unclassified", "revoked"]), confidence: z.number().min(0).max(1), effectiveAt: z.number().int().positive().safe(), expiresAt: z.number().int().positive().safe().nullable(), evidenceHash: hash }).strict()).max(100),
  executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const versions = value.versions.map((item) => item.version); if (new Set(versions).size !== versions.length || versions.some((version, index) => index > 0 && version >= versions[index - 1]!)) context.addIssue({ code: "custom", message: "Classification versions must be unique and descending.", path: ["versions"] });
  value.versions.forEach((item, index) => { if (item.expiresAt != null && item.expiresAt <= item.effectiveAt) context.addIssue({ code: "custom", message: "Classification expiry must follow activation.", path: ["versions", index, "expiresAt"] }); });
});

export const whaleAlertEvidenceSchema = z.object({
  schema: z.literal("whale-alert-evidence-v1"), id: z.string().min(8).max(128), ownerWallet: publicKey, enabled: z.boolean(),
  tokenAllowlist: z.array(publicKey).max(50), walletAllowlist: z.array(publicKey).max(50), directions: z.array(z.enum(["buy", "sell"])).min(1).max(2),
  minimumUsd: z.number().finite().nonnegative(), cooldownSeconds: z.number().int().min(60).max(86_400), version: z.number().int().positive(),
  configurationHash: hash, evaluatedOnly: z.literal(true), executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  if (new Set(value.tokenAllowlist).size !== value.tokenAllowlist.length || new Set(value.walletAllowlist).size !== value.walletAllowlist.length || new Set(value.directions).size !== value.directions.length) context.addIssue({ code: "custom", message: "Whale alert filters must be unique." });
});
