export type OperationalExpansionEvidence = {
  authoritativeEvidenceApi: boolean;
  providerOperationsProven: boolean;
  gmgnWorkflowProven: boolean;
  shadowAnalyticsProven: boolean;
  signedManifestProven: boolean;
  deviceCertificationProven: boolean;
  devnetSubmissionProven: boolean;
  reconciliationProven: boolean;
  mainnetCanaryProven: boolean;
  controlledCopyTradeProven: boolean;
};

export type OperationalExpansionGate = { phase: number; title: string; status: "complete" | "blocked"; missing: string[]; externalEvidenceRequired: boolean };

const gate = (phase: number, title: string, checks: [string, boolean][], externalEvidenceRequired = false): OperationalExpansionGate => {
  const missing = checks.filter(([, complete]) => !complete).map(([id]) => id);
  return { phase, title, status: missing.length ? "blocked" : "complete", missing, externalEvidenceRequired };
};

export function evaluateOperationalExpansion(evidence: OperationalExpansionEvidence) {
  const phases: OperationalExpansionGate[] = [];
  const p78 = gate(78, "Authoritative evidence API", [["authoritative_evidence_api", evidence.authoritativeEvidenceApi]]); phases.push(p78);
  const p79 = gate(79, "Provider operations", [["phase_78", p78.status === "complete"], ["provider_operations", evidence.providerOperationsProven]]); phases.push(p79);
  const p80 = gate(80, "GMGN workflow expansion", [["phase_78", p78.status === "complete"], ["gmgn_workflow", evidence.gmgnWorkflowProven]]); phases.push(p80);
  const p81 = gate(81, "CopyTrade shadow analytics", [["phase_78", p78.status === "complete"], ["shadow_analytics", evidence.shadowAnalyticsProven]]); phases.push(p81);
  const p82 = gate(82, "Signed transaction manifests", [["phase_78", p78.status === "complete"], ["signed_manifest", evidence.signedManifestProven]]); phases.push(p82);
  const p83 = gate(83, "Device certification automation", [["phase_82", p82.status === "complete"], ["device_certification", evidence.deviceCertificationProven]], true); phases.push(p83);
  const p84 = gate(84, "Devnet managed submission", [["phase_83", p83.status === "complete"], ["devnet_submission", evidence.devnetSubmissionProven]], true); phases.push(p84);
  const p85 = gate(85, "Reconciliation and recovery", [["phase_84", p84.status === "complete"], ["reconciliation", evidence.reconciliationProven]], true); phases.push(p85);
  const p86 = gate(86, "Mainnet canary controls", [["phase_85", p85.status === "complete"], ["mainnet_canary", evidence.mainnetCanaryProven]], true); phases.push(p86);
  phases.push(gate(87, "Controlled CopyTrade production", [["phase_81", p81.status === "complete"], ["phase_86", p86.status === "complete"], ["controlled_copytrade", evidence.controlledCopyTradeProven]], true));

  return {
    schemaVersion: "terminal-dex-phases-78-87-governance-v1",
    phases,
    highestContiguousCompletePhase: phases.reduce((highest, item) => item.status === "complete" && item.phase === highest + 1 ? item.phase : highest, 77),
    executionEnabled: false as const,
    copyTradeExecutionEnabled: false as const,
  };
}

export const emptyOperationalExpansionEvidence = (): OperationalExpansionEvidence => ({
  authoritativeEvidenceApi: false, providerOperationsProven: false, gmgnWorkflowProven: false,
  shadowAnalyticsProven: false, signedManifestProven: false, deviceCertificationProven: false,
  devnetSubmissionProven: false, reconciliationProven: false, mainnetCanaryProven: false,
  controlledCopyTradeProven: false,
});
