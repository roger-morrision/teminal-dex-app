import type { SwapInspection, SwapSimulation, SwapV2Readiness } from "@/api/schema";

export const SWAP_QUOTE_TTL_MS = 15_000;
export const isSwapQuoteExpired = (quotedAt: number, currentTime = Date.now()) =>
  Math.max(0, currentTime - quotedAt) > SWAP_QUOTE_TTL_MS;

export type ReadinessBlockerCategory = "wallet" | "provider" | "execution" | "policy" | "environment";

const categoryFor = (id: string): ReadinessBlockerCategory => {
  const normalized = id.toLowerCase();
  if (/wallet|taker|owner|sign/.test(normalized)) return "wallet";
  if (/provider|rpc|jupiter|quote|helius/.test(normalized)) return "provider";
  if (/execute|submit|broadcast|consume|managed/.test(normalized)) return "execution";
  if (/policy|legal|approval|limit|fee|risk/.test(normalized)) return "policy";
  return "environment";
};

export function evaluateSwapReadiness(readiness: SwapV2Readiness, now = Date.now()) {
  const assessedAtMs = Date.parse(`${readiness.data.assessedAt}T23:59:59.999Z`);
  const ageMs = Number.isFinite(assessedAtMs) ? Math.max(0, now - assessedAtMs) : Number.POSITIVE_INFINITY;
  const blockers = readiness.data.checks
    .filter((check) => !check.ready)
    .map((check) => ({ ...check, category: categoryFor(check.id) }));
  return {
    assessedAtMs,
    ageMs,
    stale: ageMs > 48 * 60 * 60 * 1_000,
    blockers,
    blockerCategories: [...new Set(blockers.map((blocker) => blocker.category))],
    executionEnabled: false as const,
  };
}

export function evaluateSwapEvidenceChain(input: {
  readiness: SwapV2Readiness | undefined;
  inspection: SwapInspection;
  simulation: SwapSimulation;
  wallet: string;
}) {
  const trace = input.simulation.simulation.policyTrace;
  const issues = [
    ...(input.inspection.intent.id !== input.simulation.intentId ? ["intent_identity_mismatch"] : []),
    ...(trace && trace.intentId !== input.inspection.intent.id ? ["policy_intent_mismatch"] : []),
    ...(trace && trace.ownerKey !== input.wallet ? ["policy_owner_mismatch"] : []),
    ...(trace && trace.allowed !== input.simulation.simulation.succeeded ? ["policy_simulation_outcome_mismatch"] : []),
    ...(input.readiness?.data.executionEnabled === false ? [] : ["readiness_unavailable_or_unsafe"]),
  ];
  return {
    schemaVersion: "mobile-swap-evidence-chain-v1",
    consistent: issues.length === 0,
    issues,
    policyHash: trace?.policyHash ?? null,
    replay: input.simulation.replay,
    executionEnabled: false as const,
  };
}
