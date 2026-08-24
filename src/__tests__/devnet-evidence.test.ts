import { managedDevnetRunSchema, platformCertificationSetSchema } from "@/api/devnet-evidence";

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);
const hashC = "c".repeat(64);
const run = { schema: "managed-devnet-run-evidence-v1", environment: "devnet", runId: "run_0001", manifestHash: hashA, appBuildHash: hashB, backendBuildHash: hashC, walletSignature: "1".repeat(64), submittedAt: 1, confirmedAt: 2, finalizedAt: 3, outcome: "finalized", intentConsumedOnce: true, replayRejected: true, preBroadcastRevalidated: true, killSwitchTested: true, artifactHashes: [hashA, hashB], mainnetEnabled: false, copyTradeExecutionEnabled: false };

describe("devnet and platform evidence", () => {
  it("accepts complete devnet-only chronology and rejects forged promotion", () => {
    expect(managedDevnetRunSchema.safeParse(run).success).toBe(true);
    expect(managedDevnetRunSchema.safeParse({ ...run, environment: "mainnet-beta" }).success).toBe(false);
    expect(managedDevnetRunSchema.safeParse({ ...run, mainnetEnabled: true }).success).toBe(false);
    expect(managedDevnetRunSchema.safeParse({ ...run, finalizedAt: 1 }).success).toBe(false);
  });

  it("requires distinct physical Android and iOS artifacts", () => {
    const value = { schema: "platform-certification-set-v1", android: { physical: true, walletTested: true, accessibilityTested: true, artifactHash: hashA }, ios: { physical: true, walletAdapterDeclaredUnavailable: true, accessibilityTested: true, artifactHash: hashB }, appBuildHash: hashC, executionEnabled: false };
    expect(platformCertificationSetSchema.safeParse(value).success).toBe(true);
    expect(platformCertificationSetSchema.safeParse({ ...value, ios: { ...value.ios, artifactHash: hashA } }).success).toBe(false);
  });
});
