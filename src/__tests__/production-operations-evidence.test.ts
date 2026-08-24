import { productionOperationsEvidenceSchema, releaseProvenanceSchema } from "@/api/production-operations-evidence";

const hash = (value: string) => value.repeat(64);
const artifact = (id: string, value: string) => ({ id, hash: hash(value), observedAt: 1, verifier: "verified_operator" });
const drills = ["provider_outage", "wallet_session", "submission_unknown", "rollback", "kill_switch"].map((kind, index) => ({ kind, passed: true, artifact: artifact(`artifact_${kind}`, String(index + 1)) }));

describe("production operations evidence", () => {
  it("requires distinct release artifacts and disabled execution", () => {
    const value = { schema: "release-provenance-v1", commitHash: "abcdef1", appBuildHash: hash("a"), dependencyInventoryHash: hash("b"), sourceTreeClean: true, typecheckPassed: true, lintPassed: true, testsPassed: true, webExportHash: hash("c"), androidExportHash: hash("d"), iosExportHash: hash("e"), signedArtifactHash: null, generatedAt: 1, executionEnabled: false };
    expect(releaseProvenanceSchema.safeParse(value).success).toBe(true);
    expect(releaseProvenanceSchema.safeParse({ ...value, webExportHash: value.androidExportHash }).success).toBe(false);
    expect(releaseProvenanceSchema.safeParse({ ...value, executionEnabled: true }).success).toBe(false);
  });

  it("requires every unique incident drill and rejects forged authority", () => {
    const value = { schema: "production-operations-evidence-v1", releaseHash: hash("f"), generatedAt: 2, privacy: { telemetryDefaultOff: true, redactionVerified: true, retentionApproved: true, deletionVerified: true, artifact: artifact("artifact_privacy", "a") }, supplyChain: { lockfileVerified: true, dependencyInventoryVerified: true, buildScriptsReviewed: true, artifact: artifact("artifact_supply", "b") }, observability: { crashMonitoringPrivacyReviewed: true, providerSloOperational: true, alertRoutesVerified: true, artifact: artifact("artifact_observe", "c") }, backupRestore: { backupCompleted: true, restoreCompleted: true, restorePointObjectiveMet: true, artifact: artifact("artifact_backup", "d") }, keyRotation: { rotationCompleted: true, revocationCompleted: true, staleKeyRejected: true, artifact: artifact("artifact_rotation", "e") }, incidentDrills: drills, featureGates: { unknownFlagsRejected: true, productionDefaultsFailClosed: true, approvalsBoundToRelease: true, artifact: artifact("artifact_flags", "f") }, executionEnabled: false, copyTradeExecutionEnabled: false };
    expect(productionOperationsEvidenceSchema.safeParse(value).success).toBe(true);
    expect(productionOperationsEvidenceSchema.safeParse({ ...value, incidentDrills: [...drills.slice(0, 4), drills[0]] }).success).toBe(false);
    expect(productionOperationsEvidenceSchema.safeParse({ ...value, executionEnabled: true }).success).toBe(false);
  });
});
