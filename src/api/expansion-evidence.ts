import { z } from "zod";

const evidenceId = z.string().min(8).max(96).regex(/^[a-zA-Z0-9._:-]+$/);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);

const evidenceRecord = z.object({
  id: evidenceId,
  phase: z.number().int().min(68).max(77),
  kind: z.enum(["automated", "provider", "device", "approval", "devnet", "mainnet", "copytrade"]),
  observedAt: z.number().int().positive().safe(),
  persistedAt: z.number().int().positive().safe(),
  expiresAt: z.number().int().positive().safe().nullable(),
  subject: z.string().min(1).max(160),
  artifactHash: sha256,
  verified: z.boolean(),
  verifier: z.string().min(1).max(120),
}).strict().superRefine((record, context) => {
  if (record.persistedAt < record.observedAt) context.addIssue({ code: "custom", message: "Evidence cannot persist before observation.", path: ["persistedAt"] });
  if (record.expiresAt != null && record.expiresAt <= record.observedAt) context.addIssue({ code: "custom", message: "Evidence expiry must follow observation.", path: ["expiresAt"] });
});

export const expansionEvidenceSchema = z.object({
  schema: z.literal("terminal-dex-expansion-evidence-v1"),
  generatedAt: z.number().int().positive().safe(),
  ownerWallet: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
  records: z.array(evidenceRecord).max(500),
  executionEnabled: z.literal(false),
  copyTradeExecutionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const ids = value.records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "Evidence IDs must be unique.", path: ["records"] });
  value.records.forEach((record, index) => {
    if (record.persistedAt > value.generatedAt) context.addIssue({ code: "custom", message: "Evidence cannot be newer than its envelope.", path: ["records", index, "persistedAt"] });
  });
});

export type ExpansionEvidenceEnvelope = z.infer<typeof expansionEvidenceSchema>;
