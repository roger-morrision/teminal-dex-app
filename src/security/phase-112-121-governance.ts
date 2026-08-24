export type Phase112To121Evidence = {
  releaseProvenance: boolean; supplyChainPolicy: boolean; privacyRetention: boolean; observability: boolean; backupRestore: boolean;
  keyRotation: boolean; incidentDrills: boolean; featureGateGovernance: boolean; performanceBudgets: boolean; finalProductionAcceptance: boolean;
};

export function evaluatePhases112To121(evidence: Phase112To121Evidence) {
  const definitions: { phase: number; title: string; key: keyof Phase112To121Evidence; dependencies: number[]; external: boolean }[] = [
    { phase: 112, title: "Release provenance", key: "releaseProvenance", dependencies: [], external: false },
    { phase: 113, title: "Supply-chain policy", key: "supplyChainPolicy", dependencies: [112], external: true },
    { phase: 114, title: "Privacy and retention", key: "privacyRetention", dependencies: [112], external: true },
    { phase: 115, title: "Production observability", key: "observability", dependencies: [112], external: true },
    { phase: 116, title: "Backup and restore", key: "backupRestore", dependencies: [113, 114], external: true },
    { phase: 117, title: "Key rotation and revocation", key: "keyRotation", dependencies: [113], external: true },
    { phase: 118, title: "Incident drills", key: "incidentDrills", dependencies: [115, 116, 117], external: true },
    { phase: 119, title: "Feature-gate governance", key: "featureGateGovernance", dependencies: [112, 118], external: true },
    { phase: 120, title: "Performance budgets", key: "performanceBudgets", dependencies: [112], external: true },
    { phase: 121, title: "Final production acceptance", key: "finalProductionAcceptance", dependencies: [113, 114, 115, 116, 117, 118, 119, 120], external: true },
  ];
  const phases: { phase: number; title: string; status: "complete" | "blocked"; missing: string[]; externalEvidenceRequired: boolean }[] = [];
  for (const definition of definitions) {
    const missing = [...definition.dependencies.filter((dependency) => phases.find((phase) => phase.phase === dependency)?.status !== "complete").map((dependency) => `phase_${dependency}`), ...(!evidence[definition.key] ? [definition.key] : [])];
    phases.push({ phase: definition.phase, title: definition.title, status: missing.length ? "blocked" : "complete", missing, externalEvidenceRequired: definition.external });
  }
  return { schemaVersion: "terminal-dex-phases-112-121-governance-v1", phases, highestContiguousCompletePhase: phases.reduce((highest, phase) => phase.status === "complete" && phase.phase === highest + 1 ? phase.phase : highest, 111), productionAccepted: false as const, executionEnabled: false as const };
}

export const emptyPhase112To121Evidence = (): Phase112To121Evidence => ({ releaseProvenance: false, supplyChainPolicy: false, privacyRetention: false, observability: false, backupRestore: false, keyRotation: false, incidentDrills: false, featureGateGovernance: false, performanceBudgets: false, finalProductionAcceptance: false });
