export type ProductionEvidence = {
  automatedRegression: boolean;
  providerReadinessFresh: boolean;
  androidWalletDevice: boolean;
  accessibilityDevices: boolean;
  custodyApproved: boolean;
  providerApproved: boolean;
  riskLimitsApproved: boolean;
  legalSecurityApproved: boolean;
  incidentOwnerAssigned: boolean;
  devnetSubmissionProven: boolean;
  mainnetCanaryApproved: boolean;
  mainnetCanaryProven: boolean;
  copyTradeShadowProven: boolean;
  copyTradeActivationApproved: boolean;
  productionDrillsProven: boolean;
  providerSloOperational: boolean;
};

export type PhaseStatus = "complete" | "blocked";
export type PhaseGate = { phase: number; status: PhaseStatus; missing: string[] };

const gate = (phase: number, checks: [string, boolean][]): PhaseGate => {
  const missing = checks.filter(([, ready]) => !ready).map(([name]) => name);
  return { phase, status: missing.length ? "blocked" : "complete", missing };
};

export function evaluateProductionPhases(evidence: ProductionEvidence) {
  const phases: PhaseGate[] = [];
  const phase1 = gate(1, [["automated_regression", evidence.automatedRegression], ["fresh_provider_readiness", evidence.providerReadinessFresh]]); phases.push(phase1);
  phases.push(gate(2, [["phase_1", phase1.status === "complete"], ["android_wallet_device", evidence.androidWalletDevice]]));
  phases.push(gate(3, [["phase_1", phase1.status === "complete"], ["accessibility_devices", evidence.accessibilityDevices]]));
  const phase4 = gate(4, [["custody_approval", evidence.custodyApproved], ["provider_approval", evidence.providerApproved], ["risk_limits", evidence.riskLimitsApproved], ["legal_security", evidence.legalSecurityApproved], ["incident_owner", evidence.incidentOwnerAssigned]]); phases.push(phase4);
  const phase5 = gate(5, [["phase_4", phase4.status === "complete"], ["devnet_submission", evidence.devnetSubmissionProven]]); phases.push(phase5);
  const phase6 = gate(6, [["phase_5", phase5.status === "complete"], ["mainnet_canary_approval", evidence.mainnetCanaryApproved], ["mainnet_canary_evidence", evidence.mainnetCanaryProven]]); phases.push(phase6);
  const phase7 = gate(7, [["phase_5", phase5.status === "complete"], ["copytrade_shadow", evidence.copyTradeShadowProven]]); phases.push(phase7);
  const phase8 = gate(8, [["phase_6", phase6.status === "complete"], ["phase_7", phase7.status === "complete"], ["copytrade_activation_approval", evidence.copyTradeActivationApproved]]); phases.push(phase8);
  const phase9 = gate(9, [["phase_8", phase8.status === "complete"], ["production_drills", evidence.productionDrillsProven]]); phases.push(phase9);
  phases.push(gate(10, [["phase_9", phase9.status === "complete"], ["provider_slo", evidence.providerSloOperational]]));
  return {
    schemaVersion: "terminal-dex-ten-phase-governance-v1",
    phases,
    executionEnabled: false as const,
    copyTradeExecutionEnabled: false as const,
    highestCompletePhase: phases.reduce((highest, phase) => phase.status === "complete" && phase.phase === highest + 1 ? phase.phase : highest, 0),
  };
}

export const emptyProductionEvidence = (): ProductionEvidence => ({
  automatedRegression: false,
  providerReadinessFresh: false,
  androidWalletDevice: false,
  accessibilityDevices: false,
  custodyApproved: false,
  providerApproved: false,
  riskLimitsApproved: false,
  legalSecurityApproved: false,
  incidentOwnerAssigned: false,
  devnetSubmissionProven: false,
  mainnetCanaryApproved: false,
  mainnetCanaryProven: false,
  copyTradeShadowProven: false,
  copyTradeActivationApproved: false,
  productionDrillsProven: false,
  providerSloOperational: false,
});
