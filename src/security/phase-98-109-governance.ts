export type Phase98To109Evidence = {
  durableWhaleHistoryBackend: boolean;
  mobileWhaleHistory: boolean;
  whaleAlertBackend: boolean;
  walletClassificationAuthority: boolean;
  multiProviderCorroboration: boolean;
  whaleAnalyticsMethodology: boolean;
  portfolioExposureIntegration: boolean;
  whaleOperationsHistory: boolean;
  liveBackendAndroidVerification: boolean;
  physicalAndroidCertification: boolean;
  physicalIosCertification: boolean;
  managedDevnetSubmission: boolean;
};

export type Phase98To109Gate = { phase: number; title: string; status: "complete" | "blocked"; missing: string[]; externalEvidenceRequired: boolean };
const gate = (phase: number, title: string, checks: [string, boolean][], externalEvidenceRequired = false): Phase98To109Gate => {
  const missing = checks.filter(([, ready]) => !ready).map(([id]) => id);
  return { phase, title, status: missing.length ? "blocked" : "complete", missing, externalEvidenceRequired };
};

export function evaluatePhases98To109(evidence: Phase98To109Evidence) {
  const phases: Phase98To109Gate[] = [];
  const p98 = gate(98, "Durable whale-history service", [["durable_whale_history_backend", evidence.durableWhaleHistoryBackend]], true); phases.push(p98);
  const p99 = gate(99, "Mobile whale-history workflow", [["phase_98", p98.status === "complete"], ["mobile_whale_history", evidence.mobileWhaleHistory]]); phases.push(p99);
  const p100 = gate(100, "Authoritative whale alerts", [["phase_98", p98.status === "complete"], ["whale_alert_backend", evidence.whaleAlertBackend]], true); phases.push(p100);
  const p101 = gate(101, "Wallet-classification authority", [["phase_98", p98.status === "complete"], ["wallet_classification_authority", evidence.walletClassificationAuthority]], true); phases.push(p101);
  const p102 = gate(102, "Multi-provider corroboration", [["phase_98", p98.status === "complete"], ["multi_provider_corroboration", evidence.multiProviderCorroboration]], true); phases.push(p102);
  const p103 = gate(103, "Whale analytics methodology", [["phase_99", p99.status === "complete"], ["phase_102", p102.status === "complete"], ["analytics_methodology", evidence.whaleAnalyticsMethodology]]); phases.push(p103);
  const p104 = gate(104, "Portfolio and watchlist exposure", [["phase_103", p103.status === "complete"], ["portfolio_exposure", evidence.portfolioExposureIntegration]]); phases.push(p104);
  const p105 = gate(105, "Whale operations dashboard", [["phase_98", p98.status === "complete"], ["whale_operations_history", evidence.whaleOperationsHistory]], true); phases.push(p105);
  const p106 = gate(106, "Live-backend Android verification", [["phase_99", p99.status === "complete"], ["phase_105", p105.status === "complete"], ["live_backend_android", evidence.liveBackendAndroidVerification]], true); phases.push(p106);
  const p107 = gate(107, "Physical Android certification", [["phase_106", p106.status === "complete"], ["physical_android", evidence.physicalAndroidCertification]], true); phases.push(p107);
  const p108 = gate(108, "Physical iOS certification", [["phase_104", p104.status === "complete"], ["physical_ios", evidence.physicalIosCertification]], true); phases.push(p108);
  phases.push(gate(109, "Managed devnet submission", [["phase_100", p100.status === "complete"], ["phase_101", p101.status === "complete"], ["phase_102", p102.status === "complete"], ["phase_105", p105.status === "complete"], ["phase_107", p107.status === "complete"], ["phase_108", p108.status === "complete"], ["managed_devnet_submission", evidence.managedDevnetSubmission]], true));
  return { schemaVersion: "terminal-dex-phases-98-109-governance-v1", phases, highestContiguousCompletePhase: phases.reduce((highest, item) => item.status === "complete" && item.phase === highest + 1 ? item.phase : highest, 97), executionEnabled: false as const, mobileSubmissionEnabled: false as const };
}

export const emptyPhase98To109Evidence = (): Phase98To109Evidence => ({
  durableWhaleHistoryBackend: false, mobileWhaleHistory: false, whaleAlertBackend: false, walletClassificationAuthority: false,
  multiProviderCorroboration: false, whaleAnalyticsMethodology: false, portfolioExposureIntegration: false, whaleOperationsHistory: false,
  liveBackendAndroidVerification: false, physicalAndroidCertification: false, physicalIosCertification: false, managedDevnetSubmission: false,
});
