import { evaluatePhases110To111 } from "@/security/phase-110-111-governance";

describe("phases 110-111 governance", () => {
  it("requires Phase 109 before canary and Phase 110 before CopyTrade", () => {
    const result = evaluatePhases110To111({ phase109ManagedDevnetProven: false, mainnetCanaryApprovedAndProven: false, copyTradePromotionApprovedAndProven: false });
    expect(result.phases[0]?.missing).toEqual(["phase_109", "mainnet_canary_approval_and_evidence"]);
    expect(result.phases[1]?.missing).toContain("phase_110");
    expect(result.highestContiguousCompletePhase).toBe(109);
  });

  it("never enables execution even with complete external evidence", () => {
    const result = evaluatePhases110To111({ phase109ManagedDevnetProven: true, mainnetCanaryApprovedAndProven: true, copyTradePromotionApprovedAndProven: true });
    expect(result.highestContiguousCompletePhase).toBe(111);
    expect(result.mobileExecutionEnabled).toBe(false);
    expect(result.copyTradeExecutionEnabled).toBe(false);
  });
});
