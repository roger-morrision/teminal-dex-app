import { deviceCertificationEvidenceSchema, gmgnWorkflowQuerySchema, providerOperationsEvidenceSchema, signedManifestEnvelopeSchema } from "@/api/operational-contracts";

const hash = "a".repeat(64);

describe("Phase 78-87 operational contracts", () => {
  it("accepts devnet-only signed manifest evidence and rejects forged authority", () => {
    const value = { schema: "signed-transaction-manifest-v1", manifestHash: hash, issuerKeyId: "issuer:1", issuerAlgorithm: "Ed25519", issuerSignature: "x".repeat(64), issuedAt: 1, expiresAt: 2, ownerWallet: "11111111111111111111111111111111", environment: "devnet", executionEnabled: false };
    expect(signedManifestEnvelopeSchema.safeParse(value).success).toBe(true);
    expect(signedManifestEnvelopeSchema.safeParse({ ...value, environment: "mainnet-beta" }).success).toBe(false);
    expect(signedManifestEnvelopeSchema.safeParse({ ...value, executionEnabled: true }).success).toBe(false);
  });

  it("rejects malformed operational histories and duplicated filters", () => {
    const windows = [1, 2, 3].map((observedAt) => ({ observedAt, healthy: true, incidentId: null, acknowledgedAt: null }));
    expect(providerOperationsEvidenceSchema.safeParse({ schema: "provider-operations-evidence-v1", generatedAt: 4, windows, alertRoutesVerified: true, failoverQualified: true, executionEnabled: false }).success).toBe(true);
    expect(providerOperationsEvidenceSchema.safeParse({ schema: "provider-operations-evidence-v1", generatedAt: 4, windows: [windows[0], windows[0], windows[2]], alertRoutesVerified: true, failoverQualified: true, executionEnabled: false }).success).toBe(false);
    expect(gmgnWorkflowQuerySchema.safeParse({ qualities: ["high", "high"] }).success).toBe(false);
  });

  it("requires unique physical-device artifacts", () => {
    const check = { id: "wallet_cancel", passed: true, artifactHash: hash };
    const value = { schema: "device-certification-evidence-v1", platform: "android", deviceModel: "device", osVersion: "16", appBuildHash: hash, tester: "tester", testedAt: 1, checks: [check], executionEnabled: false };
    expect(deviceCertificationEvidenceSchema.safeParse(value).success).toBe(true);
    expect(deviceCertificationEvidenceSchema.safeParse({ ...value, checks: [check, check] }).success).toBe(false);
  });
});
