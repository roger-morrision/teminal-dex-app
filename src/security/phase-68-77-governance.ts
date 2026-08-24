export type ExpansionEvidence = {
  durableEvidenceApi: boolean;
  providerHistoryOperational: boolean;
  gmgnControlsVerified: boolean;
  copyTradeShadowAnalyticsVerified: boolean;
  transactionManifestVerified: boolean;
  physicalDeviceCertification: boolean;
  managedSubmissionApproved: boolean;
  devnetAdversarialProven: boolean;
  mainnetCanaryApprovedAndProven: boolean;
  copyTradeActivationApprovedAndProven: boolean;
};

export type ExpansionPhaseGate = {
  phase: number;
  title: string;
  status: "complete" | "blocked";
  missing: string[];
  externalEvidenceRequired: boolean;
};

const phase = (
  phaseNumber: number,
  title: string,
  checks: [string, boolean][],
  externalEvidenceRequired = false,
): ExpansionPhaseGate => {
  const missing = checks.filter(([, ready]) => !ready).map(([name]) => name);
  return { phase: phaseNumber, title, status: missing.length === 0 ? "complete" : "blocked", missing, externalEvidenceRequired };
};

export function evaluateExpansionPhases(evidence: ExpansionEvidence) {
  const phases: ExpansionPhaseGate[] = [];
  const p68 = phase(68, "Durable evidence", [["durable_evidence_api", evidence.durableEvidenceApi]]); phases.push(p68);
  const p69 = phase(69, "Provider observability", [["phase_68", p68.status === "complete"], ["provider_history_operational", evidence.providerHistoryOperational]]); phases.push(p69);
  const p70 = phase(70, "GMGN intelligence", [["phase_68", p68.status === "complete"], ["gmgn_controls_verified", evidence.gmgnControlsVerified]]); phases.push(p70);
  const p71 = phase(71, "CopyTrade shadow operations", [["phase_68", p68.status === "complete"], ["copytrade_shadow_analytics", evidence.copyTradeShadowAnalyticsVerified]]); phases.push(p71);
  const p72 = phase(72, "Transaction integrity", [["phase_68", p68.status === "complete"], ["transaction_manifest_verified", evidence.transactionManifestVerified]]); phases.push(p72);
  const p73 = phase(73, "Physical-device certification", [["phase_72", p72.status === "complete"], ["physical_device_certification", evidence.physicalDeviceCertification]], true); phases.push(p73);
  const p74 = phase(74, "Managed submission approval", [["phase_73", p73.status === "complete"], ["managed_submission_approved", evidence.managedSubmissionApproved]], true); phases.push(p74);
  const p75 = phase(75, "Devnet adversarial rollout", [["phase_74", p74.status === "complete"], ["devnet_adversarial_evidence", evidence.devnetAdversarialProven]], true); phases.push(p75);
  const p76 = phase(76, "Mainnet canary", [["phase_75", p75.status === "complete"], ["mainnet_canary_approval_and_evidence", evidence.mainnetCanaryApprovedAndProven]], true); phases.push(p76);
  phases.push(phase(77, "Controlled CopyTrade activation", [["phase_71", p71.status === "complete"], ["phase_76", p76.status === "complete"], ["copytrade_activation_approval_and_evidence", evidence.copyTradeActivationApprovedAndProven]], true));

  return {
    schemaVersion: "terminal-dex-phases-68-77-governance-v1",
    phases,
    highestContiguousCompletePhase: phases.reduce((highest, item) => item.status === "complete" && item.phase === highest + 1 ? item.phase : highest, 67),
    executionEnabled: false as const,
    copyTradeExecutionEnabled: false as const,
  };
}

export const emptyExpansionEvidence = (): ExpansionEvidence => ({
  durableEvidenceApi: false,
  providerHistoryOperational: false,
  gmgnControlsVerified: false,
  copyTradeShadowAnalyticsVerified: false,
  transactionManifestVerified: false,
  physicalDeviceCertification: false,
  managedSubmissionApproved: false,
  devnetAdversarialProven: false,
  mainnetCanaryApprovedAndProven: false,
  copyTradeActivationApprovedAndProven: false,
});
