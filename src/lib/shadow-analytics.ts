export type ShadowOutcome = { id: string; strategyId: string; strategyVersion: string; action: "paper_buy" | "paper_sell" | "reject" | "hold"; returnPct: number | null; expectedOutput: number | null; observedOutput: number | null };

export function summarizeShadowOutcomes(records: ShadowOutcome[]) {
  const identities = records.map((record) => record.id);
  if (new Set(identities).size !== identities.length) throw new Error("Shadow outcome IDs must be unique.");
  const resolved = records.filter((record) => record.returnPct != null);
  const returns = resolved.map((record) => record.returnPct!);
  const positive = returns.filter((value) => value > 0).length;
  const drifts = records.flatMap((record) => record.expectedOutput != null && record.expectedOutput > 0 && record.observedOutput != null
    ? [Math.abs(record.observedOutput - record.expectedOutput) / record.expectedOutput] : []);
  return {
    schemaVersion: "copytrade-shadow-analytics-v1",
    total: records.length,
    resolved: resolved.length,
    coverage: records.length ? resolved.length / records.length : 0,
    winRate: resolved.length ? positive / resolved.length : null,
    averageReturnPct: returns.length ? returns.reduce((sum, value) => sum + value, 0) / returns.length : null,
    averageOutputDrift: drifts.length ? drifts.reduce((sum, value) => sum + value, 0) / drifts.length : null,
    executionEnabled: false as const,
  };
}
