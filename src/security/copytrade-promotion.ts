export type CopyTradePromotionStage = "shadow" | "paper" | "restricted_canary" | "limited_production";
export type CopyTradePromotionEvent = "qualify_shadow" | "qualify_paper" | "qualify_canary" | "approve_limited" | "rollback";

const transitions: Record<CopyTradePromotionStage, Partial<Record<CopyTradePromotionEvent, CopyTradePromotionStage>>> = {
  shadow: { qualify_shadow: "paper", rollback: "shadow" },
  paper: { qualify_paper: "restricted_canary", rollback: "shadow" },
  restricted_canary: { approve_limited: "limited_production", rollback: "paper" },
  limited_production: { rollback: "restricted_canary" },
};

export function transitionCopyTradePromotion(stage: CopyTradePromotionStage, event: CopyTradePromotionEvent) {
  const next = transitions[stage][event];
  if (!next) throw new Error(`Invalid CopyTrade promotion: ${stage} -> ${event}`);
  return next;
}

export type CopyTradePromotionReadiness = {
  managedDevnetProven: boolean;
  mainnetCanaryProven: boolean;
  shadowCoverage: number;
  reconciliationCoverage: number;
  duplicatePreventionVerified: boolean;
  outagePauseVerified: boolean;
  ownerKillSwitchVerified: boolean;
  globalKillSwitchVerified: boolean;
  rollbackTested: boolean;
  ownerApprovalRecorded: boolean;
  productionApprovalRecorded: boolean;
};

export function evaluateCopyTradePromotion(input: CopyTradePromotionReadiness) {
  const reasons = [
    ...(!input.managedDevnetProven ? ["managed_devnet_missing"] : []),
    ...(!input.mainnetCanaryProven ? ["mainnet_canary_missing"] : []),
    ...(!Number.isFinite(input.shadowCoverage) || input.shadowCoverage < 0.99 ? ["shadow_coverage_below_99_percent"] : []),
    ...(!Number.isFinite(input.reconciliationCoverage) || input.reconciliationCoverage < 1 ? ["reconciliation_incomplete"] : []),
    ...(!input.duplicatePreventionVerified ? ["duplicate_prevention_missing"] : []),
    ...(!input.outagePauseVerified ? ["outage_pause_missing"] : []),
    ...(!input.ownerKillSwitchVerified ? ["owner_kill_switch_missing"] : []),
    ...(!input.globalKillSwitchVerified ? ["global_kill_switch_missing"] : []),
    ...(!input.rollbackTested ? ["rollback_missing"] : []),
    ...(!input.ownerApprovalRecorded ? ["owner_approval_missing"] : []),
    ...(!input.productionApprovalRecorded ? ["production_approval_missing"] : []),
  ];
  return { schemaVersion: "copytrade-promotion-readiness-v1", eligibleForExternalPromotionReview: reasons.length === 0, reasons, executionEnabled: false as const, activationAuthority: "absent" as const };
}
