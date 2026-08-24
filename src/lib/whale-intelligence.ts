export type WhaleAmountEvidence = { amountUsd: number | null; direction: "buy" | "sell"; wallet: string | null };
export function evaluateWhaleFlowQuality(events: WhaleAmountEvidence[]) {
  const known = events.filter((event) => event.amountUsd != null && Number.isFinite(event.amountUsd) && event.amountUsd >= 0);
  const knownBuyUsd = known.filter((event) => event.direction === "buy").reduce((sum, event) => sum + event.amountUsd!, 0);
  const knownSellUsd = known.filter((event) => event.direction === "sell").reduce((sum, event) => sum + event.amountUsd!, 0);
  return { schemaVersion: "whale-flow-quality-v1", eventCount: events.length, knownAmountCount: known.length, missingAmountCount: events.length - known.length, amountCoverage: events.length ? known.length / events.length : 0, knownBuyUsd, knownSellUsd, knownNetUsd: knownBuyUsd - knownSellUsd, uniqueKnownWallets: new Set(events.flatMap((event) => event.wallet ? [event.wallet] : [])).size };
}

export type ProviderObservation = { provider: string; direction: "buy" | "sell"; tokenAddress: string; wallet: string | null; amountUsd: number | null };
export function corroborateWhaleEvent(observations: ProviderObservation[]) {
  const providers = new Set(observations.map((item) => item.provider));
  const identities = new Set(observations.map((item) => `${item.direction}\0${item.tokenAddress}\0${item.wallet ?? ""}`));
  const amounts = observations.flatMap((item) => item.amountUsd == null ? [] : [item.amountUsd]);
  const amountSpread = amounts.length > 1 ? (Math.max(...amounts) - Math.min(...amounts)) / Math.max(Math.max(...amounts), 1) : 0;
  const status = observations.length === 0 ? "unavailable" : identities.size > 1 || amountSpread > 0.05 ? "conflicting" : providers.size >= 2 ? "confirmed" : "partial";
  return { schemaVersion: "whale-corroboration-v1", status, providerCount: providers.size, amountSpread, executionEnabled: false as const };
}

export type WhaleOutcome = { observedAt: number; netUsd: number; subsequentReturnPct: number | null };
export function summarizeWhaleOutcomes(rows: WhaleOutcome[]) {
  const resolved = rows.filter((row) => row.subsequentReturnPct != null);
  return { schemaVersion: "whale-outcomes-v1", observations: rows.length, resolved: resolved.length, coverage: rows.length ? resolved.length / rows.length : 0, averageSubsequentReturnPct: resolved.length ? resolved.reduce((sum, row) => sum + row.subsequentReturnPct!, 0) / resolved.length : null, predictiveClaim: false as const, executionEnabled: false as const };
}

export type PortfolioExposure = { tokenAddress: string; valueUsd: number };
export function calculateWhalePortfolioExposure(holdings: PortfolioExposure[], whaleTokenAddresses: Set<string>) {
  const totalUsd = holdings.reduce((sum, holding) => sum + Math.max(0, holding.valueUsd), 0);
  const exposedUsd = holdings.filter((holding) => whaleTokenAddresses.has(holding.tokenAddress)).reduce((sum, holding) => sum + Math.max(0, holding.valueUsd), 0);
  return { schemaVersion: "whale-portfolio-exposure-v1", totalUsd, exposedUsd, exposureRatio: totalUsd > 0 ? exposedUsd / totalUsd : 0, advice: false as const, executionEnabled: false as const };
}

export type WhaleSloSample = { observedAt: number; received: number; persisted: number; ageMs: number; classificationDrift: number; gapDetected: boolean };
export function evaluateWhaleOperations(samples: WhaleSloSample[], staleAfterMs: number) {
  const ordered = samples.every((sample, index) => index === 0 || sample.observedAt > samples[index - 1]!.observedAt);
  const healthy = samples.filter((sample) => sample.received > 0 && sample.persisted / sample.received >= 0.99 && sample.ageMs <= staleAfterMs && sample.classificationDrift <= 0.01 && !sample.gapDetected).length;
  const reasons = [...(samples.length < 3 || samples.length > 288 ? ["invalid_history_window"] : []), ...(!ordered ? ["unordered_history"] : []), ...(healthy !== samples.length ? ["unhealthy_whale_window"] : [])];
  return { schemaVersion: "whale-operations-v1", operational: reasons.length === 0, healthy, sampleCount: samples.length, reasons };
}
