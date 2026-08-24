import { evaluateCopyTradePromotion, transitionCopyTradePromotion, type CopyTradePromotionReadiness } from "@/security/copytrade-promotion";

const complete: CopyTradePromotionReadiness = { managedDevnetProven: true, mainnetCanaryProven: true, shadowCoverage: 1, reconciliationCoverage: 1, duplicatePreventionVerified: true, outagePauseVerified: true, ownerKillSwitchVerified: true, globalKillSwitchVerified: true, rollbackTested: true, ownerApprovalRecorded: true, productionApprovalRecorded: true };

describe("CopyTrade promotion", () => {
  it("allows only ordered stage transitions and rollback", () => {
    expect(transitionCopyTradePromotion("shadow", "qualify_shadow")).toBe("paper");
    expect(transitionCopyTradePromotion("paper", "qualify_paper")).toBe("restricted_canary");
    expect(transitionCopyTradePromotion("restricted_canary", "approve_limited")).toBe("limited_production");
    expect(transitionCopyTradePromotion("limited_production", "rollback")).toBe("restricted_canary");
    expect(() => transitionCopyTradePromotion("shadow", "approve_limited")).toThrow("Invalid CopyTrade promotion");
  });

  it("requires complete evidence but never grants activation authority", () => {
    expect(evaluateCopyTradePromotion(complete)).toEqual({ schemaVersion: "copytrade-promotion-readiness-v1", eligibleForExternalPromotionReview: true, reasons: [], executionEnabled: false, activationAuthority: "absent" });
    expect(evaluateCopyTradePromotion({ ...complete, mainnetCanaryProven: false, shadowCoverage: 0.5 }).reasons).toEqual(expect.arrayContaining(["mainnet_canary_missing", "shadow_coverage_below_99_percent"]));
  });
});
