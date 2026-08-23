import type { SwapV2Readiness } from "@/api/schema";

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
