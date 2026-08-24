import { z } from "zod";

const publicKey = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);

export const signedManifestEnvelopeSchema = z.object({
  schema: z.literal("signed-transaction-manifest-v1"),
  manifestHash: hash,
  issuerKeyId: z.string().min(8).max(120),
  issuerAlgorithm: z.literal("Ed25519"),
  issuerSignature: z.string().min(64).max(256),
  issuedAt: z.number().int().positive().safe(),
  expiresAt: z.number().int().positive().safe(),
  ownerWallet: publicKey,
  environment: z.literal("devnet"),
  executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  if (value.expiresAt <= value.issuedAt) context.addIssue({ code: "custom", message: "Manifest expiry must follow issuance.", path: ["expiresAt"] });
});

export const providerOperationsEvidenceSchema = z.object({
  schema: z.literal("provider-operations-evidence-v1"),
  generatedAt: z.number().int().positive().safe(),
  windows: z.array(z.object({ observedAt: z.number().int().positive().safe(), healthy: z.boolean(), incidentId: z.string().min(8).max(96).nullable(), acknowledgedAt: z.number().int().positive().safe().nullable() }).strict()).min(3).max(288),
  alertRoutesVerified: z.boolean(),
  failoverQualified: z.boolean(),
  executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const times = value.windows.map((window) => window.observedAt);
  if (new Set(times).size !== times.length || times.some((time, index) => index > 0 && time <= times[index - 1]!)) context.addIssue({ code: "custom", message: "Provider windows must be unique and ascending.", path: ["windows"] });
  value.windows.forEach((window, index) => {
    if (window.acknowledgedAt != null && window.acknowledgedAt < window.observedAt) context.addIssue({ code: "custom", message: "Acknowledgement cannot precede observation.", path: ["windows", index, "acknowledgedAt"] });
  });
});

export const gmgnWorkflowQuerySchema = z.object({
  cursor: z.string().min(8).max(256).optional(),
  minConfidence: z.number().min(0).max(1).default(0),
  qualities: z.array(z.string().min(1).max(80)).max(8).default([]),
  verifiedOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(50).default(25),
}).strict().superRefine((value, context) => {
  if (new Set(value.qualities).size !== value.qualities.length) context.addIssue({ code: "custom", message: "Quality filters must be unique.", path: ["qualities"] });
});

export const deviceCertificationEvidenceSchema = z.object({
  schema: z.literal("device-certification-evidence-v1"),
  platform: z.enum(["android", "ios"]),
  deviceModel: z.string().min(2).max(120),
  osVersion: z.string().min(1).max(40),
  appBuildHash: hash,
  tester: z.string().min(2).max(120),
  testedAt: z.number().int().positive().safe(),
  checks: z.array(z.object({ id: z.string().min(2).max(80), passed: z.boolean(), artifactHash: hash }).strict()).min(1).max(32),
  executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const ids = value.checks.map((check) => check.id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "Device check IDs must be unique.", path: ["checks"] });
});
