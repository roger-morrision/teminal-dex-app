import { z } from "zod";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const artifact = z.object({ id: z.string().min(8).max(128), hash, observedAt: z.number().int().positive().safe(), verifier: z.string().min(3).max(120) }).strict();

export const releaseProvenanceSchema = z.object({
  schema: z.literal("release-provenance-v1"), commitHash: z.string().regex(/^[a-f0-9]{7,40}$/), appBuildHash: hash,
  dependencyInventoryHash: hash, sourceTreeClean: z.literal(true), typecheckPassed: z.literal(true), lintPassed: z.literal(true), testsPassed: z.literal(true),
  webExportHash: hash, androidExportHash: hash, iosExportHash: hash, signedArtifactHash: hash.nullable(), generatedAt: z.number().int().positive().safe(),
  executionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const hashes = [value.appBuildHash, value.dependencyInventoryHash, value.webExportHash, value.androidExportHash, value.iosExportHash];
  if (new Set(hashes).size !== hashes.length) context.addIssue({ code: "custom", message: "Release artifacts must have distinct hashes.", path: ["appBuildHash"] });
});

export const productionOperationsEvidenceSchema = z.object({
  schema: z.literal("production-operations-evidence-v1"), releaseHash: hash, generatedAt: z.number().int().positive().safe(),
  privacy: z.object({ telemetryDefaultOff: z.literal(true), redactionVerified: z.literal(true), retentionApproved: z.boolean(), deletionVerified: z.boolean(), artifact }).strict(),
  supplyChain: z.object({ lockfileVerified: z.boolean(), dependencyInventoryVerified: z.boolean(), buildScriptsReviewed: z.boolean(), artifact }).strict(),
  observability: z.object({ crashMonitoringPrivacyReviewed: z.boolean(), providerSloOperational: z.boolean(), alertRoutesVerified: z.boolean(), artifact }).strict(),
  backupRestore: z.object({ backupCompleted: z.boolean(), restoreCompleted: z.boolean(), restorePointObjectiveMet: z.boolean(), artifact }).strict(),
  keyRotation: z.object({ rotationCompleted: z.boolean(), revocationCompleted: z.boolean(), staleKeyRejected: z.boolean(), artifact }).strict(),
  incidentDrills: z.array(z.object({ kind: z.enum(["provider_outage", "wallet_session", "submission_unknown", "rollback", "kill_switch"]), passed: z.boolean(), artifact }).strict()).length(5),
  featureGates: z.object({ unknownFlagsRejected: z.boolean(), productionDefaultsFailClosed: z.boolean(), approvalsBoundToRelease: z.boolean(), artifact }).strict(),
  executionEnabled: z.literal(false), copyTradeExecutionEnabled: z.literal(false),
}).strict().superRefine((value, context) => {
  const kinds = value.incidentDrills.map((drill) => drill.kind); if (new Set(kinds).size !== kinds.length) context.addIssue({ code: "custom", message: "Every incident drill kind must be unique.", path: ["incidentDrills"] });
});
