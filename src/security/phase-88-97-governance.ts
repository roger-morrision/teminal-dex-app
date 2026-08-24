export type WhaleExpansionEvidence = {
  evidenceIntegrityProven: boolean;
  historyApiProven: boolean;
  flowQualityProven: boolean;
  walletIdentityHistoryProven: boolean;
  whaleAlertContractProven: boolean;
  corroborationProven: boolean;
  analyticsProven: boolean;
  portfolioExposureProven: boolean;
  operationsProven: boolean;
  physicalDeviceReleaseProven: boolean;
};

export type WhaleExpansionGate = { phase: number; title: string; status: "complete" | "blocked"; missing: string[]; externalEvidenceRequired: boolean };
const gate = (phase: number, title: string, checks: [string, boolean][], externalEvidenceRequired = false): WhaleExpansionGate => {
  const missing = checks.filter(([, ready]) => !ready).map(([id]) => id);
  return { phase, title, status: missing.length ? "blocked" : "complete", missing, externalEvidenceRequired };
};

export function evaluateWhaleExpansion(evidence: WhaleExpansionEvidence) {
  const phases: WhaleExpansionGate[] = [];
  const p88 = gate(88, "Whale evidence integrity", [["evidence_integrity", evidence.evidenceIntegrityProven]]); phases.push(p88);
  const p89 = gate(89, "Whale history API", [["phase_88", p88.status === "complete"], ["history_api", evidence.historyApiProven]]); phases.push(p89);
  const p90 = gate(90, "Whale flow quality", [["phase_88", p88.status === "complete"], ["flow_quality", evidence.flowQualityProven]]); phases.push(p90);
  const p91 = gate(91, "Wallet identity history", [["phase_88", p88.status === "complete"], ["wallet_identity_history", evidence.walletIdentityHistoryProven]]); phases.push(p91);
  const p92 = gate(92, "Whale alert contracts", [["phase_89", p89.status === "complete"], ["phase_91", p91.status === "complete"], ["whale_alert_contract", evidence.whaleAlertContractProven]], true); phases.push(p92);
  const p93 = gate(93, "Cross-provider corroboration", [["phase_89", p89.status === "complete"], ["corroboration", evidence.corroborationProven]]); phases.push(p93);
  const p94 = gate(94, "Whale analytics", [["phase_90", p90.status === "complete"], ["phase_93", p93.status === "complete"], ["analytics", evidence.analyticsProven]]); phases.push(p94);
  const p95 = gate(95, "Portfolio exposure", [["phase_94", p94.status === "complete"], ["portfolio_exposure", evidence.portfolioExposureProven]]); phases.push(p95);
  const p96 = gate(96, "Whale operations", [["phase_89", p89.status === "complete"], ["operations", evidence.operationsProven]]); phases.push(p96);
  phases.push(gate(97, "Device and release certification", [["phase_92", p92.status === "complete"], ["phase_95", p95.status === "complete"], ["phase_96", p96.status === "complete"], ["physical_device_release", evidence.physicalDeviceReleaseProven]], true));
  return { schemaVersion: "terminal-dex-phases-88-97-governance-v1", phases, highestContiguousCompletePhase: phases.reduce((highest, item) => item.status === "complete" && item.phase === highest + 1 ? item.phase : highest, 87), executionEnabled: false as const };
}

export const emptyWhaleExpansionEvidence = (): WhaleExpansionEvidence => ({
  evidenceIntegrityProven: false, historyApiProven: false, flowQualityProven: false, walletIdentityHistoryProven: false,
  whaleAlertContractProven: false, corroborationProven: false, analyticsProven: false, portfolioExposureProven: false,
  operationsProven: false, physicalDeviceReleaseProven: false,
});
