import { z } from "zod";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const publicKey = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
const transactionSignature = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{64,96}$/);

export const mainnetCanaryEvidenceSchema = z.object({
  schema: z.literal("mainnet-canary-evidence-v1"),
  environment: z.literal("mainnet-beta"),
  approvalId: z.string().min(8).max(128),
  approvalHash: hash,
  approvedBy: z.array(z.object({ role: z.enum(["executive", "risk", "security", "legal", "operations"]), identity: z.string().min(3).max(120), approvedAt: z.number().int().positive().safe() }).strict()).length(5),
  wallet: publicKey,
  allowedMints: z.array(publicKey).min(2).max(20),
  limits: z.object({ maxTradeUsd: z.number().positive(), maxDailyUsd: z.number().positive(), maxFeeLamports: z.number().int().positive(), maxLossUsd: z.number().positive(), expiresAt: z.number().int().positive().safe() }).strict(),
  run: z.object({ startedAt: z.number().int().positive().safe(), endedAt: z.number().int().positive().safe(), transactionSignatures: z.array(transactionSignature).min(1).max(20), totalUsd: z.number().positive(), totalFeesLamports: z.number().int().nonnegative(), realizedLossUsd: z.number().nonnegative(), reconciled: z.literal(true), rollbackTested: z.literal(true), killSwitchTested: z.literal(true), artifactHashes: z.array(hash).min(1).max(32) }).strict(),
  copyTradeExecutionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const roles = value.approvedBy.map((approval) => approval.role);
  if (new Set(roles).size !== roles.length) context.addIssue({ code: "custom", message: "Every canary approval role must be unique.", path: ["approvedBy"] });
  if (new Set(value.allowedMints).size !== value.allowedMints.length) context.addIssue({ code: "custom", message: "Allowed mints must be unique.", path: ["allowedMints"] });
  if (new Set(value.run.transactionSignatures).size !== value.run.transactionSignatures.length || new Set(value.run.artifactHashes).size !== value.run.artifactHashes.length) context.addIssue({ code: "custom", message: "Canary run evidence must be unique.", path: ["run"] });
  if (value.run.endedAt < value.run.startedAt || value.run.endedAt > value.limits.expiresAt) context.addIssue({ code: "custom", message: "Canary run falls outside its approval window.", path: ["run", "endedAt"] });
  if (value.run.totalUsd > value.limits.maxDailyUsd || value.run.totalFeesLamports > value.limits.maxFeeLamports * value.run.transactionSignatures.length || value.run.realizedLossUsd >= value.limits.maxLossUsd) context.addIssue({ code: "custom", message: "Canary run exceeded approved limits.", path: ["run"] });
});

export const copyTradePromotionEvidenceSchema = z.object({
  schema: z.literal("copytrade-promotion-evidence-v1"),
  strategyId: z.string().min(1).max(64),
  strategyVersion: z.string().min(1).max(64),
  ownerWallet: publicKey,
  stage: z.enum(["shadow", "paper", "restricted_canary", "limited_production"]),
  cohortSize: z.number().int().positive().max(10_000),
  evidenceWindowDays: z.number().int().min(7).max(365),
  limitsHash: hash,
  shadowCoverage: z.number().min(0).max(1),
  reconciliationCoverage: z.number().min(0).max(1),
  duplicatePreventionVerified: z.boolean(),
  outagePauseVerified: z.boolean(),
  ownerKillSwitchVerified: z.boolean(),
  globalKillSwitchVerified: z.boolean(),
  rollbackTested: z.boolean(),
  approved: z.literal(false),
  executionEnabled: z.literal(false),
}).strict();
