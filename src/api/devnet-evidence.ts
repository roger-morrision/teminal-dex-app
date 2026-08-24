import { z } from "zod";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const signature = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{64,96}$/);

export const managedDevnetRunSchema = z.object({
  schema: z.literal("managed-devnet-run-evidence-v1"),
  environment: z.literal("devnet"),
  runId: z.string().min(8).max(128),
  manifestHash: hash,
  appBuildHash: hash,
  backendBuildHash: hash,
  walletSignature: signature,
  submittedAt: z.number().int().positive().safe(),
  confirmedAt: z.number().int().positive().safe().nullable(),
  finalizedAt: z.number().int().positive().safe().nullable(),
  outcome: z.enum(["finalized", "failed", "reconciled_failed"]),
  intentConsumedOnce: z.literal(true),
  replayRejected: z.literal(true),
  preBroadcastRevalidated: z.literal(true),
  killSwitchTested: z.literal(true),
  artifactHashes: z.array(hash).min(1).max(32),
  mainnetEnabled: z.literal(false),
  copyTradeExecutionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  if (new Set(value.artifactHashes).size !== value.artifactHashes.length) context.addIssue({ code: "custom", message: "Devnet artifact hashes must be unique.", path: ["artifactHashes"] });
  if (value.confirmedAt != null && value.confirmedAt < value.submittedAt) context.addIssue({ code: "custom", message: "Confirmation cannot precede submission.", path: ["confirmedAt"] });
  if (value.finalizedAt != null && (value.confirmedAt == null || value.finalizedAt < value.confirmedAt)) context.addIssue({ code: "custom", message: "Finality requires prior confirmation.", path: ["finalizedAt"] });
  if (value.outcome === "finalized" && value.finalizedAt == null) context.addIssue({ code: "custom", message: "Finalized outcome requires finality evidence.", path: ["finalizedAt"] });
});

export const platformCertificationSetSchema = z.object({
  schema: z.literal("platform-certification-set-v1"),
  android: z.object({ physical: z.literal(true), walletTested: z.literal(true), accessibilityTested: z.literal(true), artifactHash: hash }).strict(),
  ios: z.object({ physical: z.literal(true), walletAdapterDeclaredUnavailable: z.literal(true), accessibilityTested: z.literal(true), artifactHash: hash }).strict(),
  appBuildHash: hash,
  executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  if (value.android.artifactHash === value.ios.artifactHash) context.addIssue({ code: "custom", message: "Platform evidence artifacts must be distinct.", path: ["ios", "artifactHash"] });
});
