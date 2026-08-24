import { copyTradePromotionEvidenceSchema, mainnetCanaryEvidenceSchema } from "@/api/production-promotion-evidence";

const hash = (character: string) => character.repeat(64);
const wallet = "11111111111111111111111111111111";
const mint = "So11111111111111111111111111111111111111112";
const approvals = ["executive", "risk", "security", "legal", "operations"].map((role, index) => ({ role, identity: `approver_${role}`, approvedAt: index + 1 }));
const canary = { schema: "mainnet-canary-evidence-v1", environment: "mainnet-beta", approvalId: "approval_0001", approvalHash: hash("a"), approvedBy: approvals, wallet, allowedMints: [wallet, mint], limits: { maxTradeUsd: 10, maxDailyUsd: 20, maxFeeLamports: 1_000, maxLossUsd: 5, expiresAt: 100 }, run: { startedAt: 10, endedAt: 20, transactionSignatures: ["1".repeat(64)], totalUsd: 5, totalFeesLamports: 500, realizedLossUsd: 0, reconciled: true, rollbackTested: true, killSwitchTested: true, artifactHashes: [hash("b")] }, copyTradeExecutionEnabled: false };

describe("production promotion evidence", () => {
  it("accepts an in-limit canary and rejects approval or limit forgery", () => {
    expect(mainnetCanaryEvidenceSchema.safeParse(canary).success).toBe(true);
    expect(mainnetCanaryEvidenceSchema.safeParse({ ...canary, approvedBy: [...approvals.slice(0, 4), approvals[0]] }).success).toBe(false);
    expect(mainnetCanaryEvidenceSchema.safeParse({ ...canary, run: { ...canary.run, totalUsd: 30 } }).success).toBe(false);
    expect(mainnetCanaryEvidenceSchema.safeParse({ ...canary, copyTradeExecutionEnabled: true }).success).toBe(false);
  });

  it("keeps CopyTrade promotion evidence explicitly unapproved and disabled", () => {
    const value = { schema: "copytrade-promotion-evidence-v1", strategyId: "strategy", strategyVersion: "v1", ownerWallet: wallet, stage: "shadow", cohortSize: 10, evidenceWindowDays: 30, limitsHash: hash("c"), shadowCoverage: 1, reconciliationCoverage: 1, duplicatePreventionVerified: true, outagePauseVerified: true, ownerKillSwitchVerified: true, globalKillSwitchVerified: true, rollbackTested: true, approved: false, executionEnabled: false };
    expect(copyTradePromotionEvidenceSchema.safeParse(value).success).toBe(true);
    expect(copyTradePromotionEvidenceSchema.safeParse({ ...value, approved: true }).success).toBe(false);
    expect(copyTradePromotionEvidenceSchema.safeParse({ ...value, executionEnabled: true }).success).toBe(false);
  });
});
