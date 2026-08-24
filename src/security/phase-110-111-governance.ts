export type Phase110To111Evidence = { phase109ManagedDevnetProven: boolean; mainnetCanaryApprovedAndProven: boolean; copyTradePromotionApprovedAndProven: boolean };

export function evaluatePhases110To111(evidence: Phase110To111Evidence) {
  const phase110Missing = [...(!evidence.phase109ManagedDevnetProven ? ["phase_109"] : []), ...(!evidence.mainnetCanaryApprovedAndProven ? ["mainnet_canary_approval_and_evidence"] : [])];
  const phase110Complete = phase110Missing.length === 0;
  const phase111Missing = [...(!phase110Complete ? ["phase_110"] : []), ...(!evidence.copyTradePromotionApprovedAndProven ? ["copytrade_promotion_approval_and_evidence"] : [])];
  return {
    schemaVersion: "terminal-dex-phases-110-111-governance-v1",
    phases: [
      { phase: 110, title: "Mainnet canary", status: phase110Complete ? "complete" as const : "blocked" as const, missing: phase110Missing, externalEvidenceRequired: true },
      { phase: 111, title: "Controlled CopyTrade production", status: phase111Missing.length ? "blocked" as const : "complete" as const, missing: phase111Missing, externalEvidenceRequired: true },
    ],
    highestContiguousCompletePhase: !phase110Complete ? 109 : phase111Missing.length ? 110 : 111,
    mobileExecutionEnabled: false as const,
    copyTradeExecutionEnabled: false as const,
  };
}
