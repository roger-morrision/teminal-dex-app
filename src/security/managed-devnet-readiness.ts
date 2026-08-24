export type ManagedDevnetEvidence = {
  custodyApproved: boolean;
  signerApproved: boolean;
  providerApproved: boolean;
  programAllowlistApproved: boolean;
  riskLimitsApproved: boolean;
  legalSecurityApproved: boolean;
  incidentOwnerAssigned: boolean;
  auditRetentionApproved: boolean;
  androidWalletCertified: boolean;
  iosLimitationsCertified: boolean;
  signedManifestVerified: boolean;
  oneTimeConsumptionVerified: boolean;
  expiryAndReplayVerified: boolean;
  finalityAndReorgVerified: boolean;
  reconciliationVerified: boolean;
  killSwitchVerified: boolean;
};

export function evaluateManagedDevnetReadiness(evidence: ManagedDevnetEvidence) {
  const checks = Object.entries(evidence) as [keyof ManagedDevnetEvidence, boolean][];
  const missing = checks.filter(([, ready]) => !ready).map(([id]) => id);
  return {
    schemaVersion: "managed-devnet-readiness-v1",
    readyForExternalDevnetRun: missing.length === 0,
    missing,
    mobileSubmissionEnabled: false as const,
    mainnetEnabled: false as const,
    copyTradeExecutionEnabled: false as const,
  };
}

export const emptyManagedDevnetEvidence = (): ManagedDevnetEvidence => ({
  custodyApproved: false, signerApproved: false, providerApproved: false, programAllowlistApproved: false,
  riskLimitsApproved: false, legalSecurityApproved: false, incidentOwnerAssigned: false, auditRetentionApproved: false,
  androidWalletCertified: false, iosLimitationsCertified: false, signedManifestVerified: false, oneTimeConsumptionVerified: false,
  expiryAndReplayVerified: false, finalityAndReorgVerified: false, reconciliationVerified: false, killSwitchVerified: false,
});
