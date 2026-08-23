import { evaluateSwapReadiness } from "@/lib/swap-readiness";
import type { SwapV2Readiness } from "@/api/schema";

const evidence = {
  success: true,
  data: {
    schema: "jupiter-swap-v2-readiness-v1",
    status: "blocked",
    executionEnabled: false,
    assessedAt: "2026-08-20",
    checks: [
      { id: "walletTaker", ready: false, evidence: "Wallet required." },
      { id: "managedExecution", ready: false, evidence: "Managed execution absent." },
      { id: "rpcProvider", ready: true, evidence: "RPC configured." },
    ],
    completed: 1,
    total: 3,
    provider: { name: "Jupiter" },
  },
} as SwapV2Readiness;

describe("swap readiness interpretation", () => {
  it("classifies blockers and keeps execution disabled", () => {
    const result = evaluateSwapReadiness(evidence, Date.parse("2026-08-21T12:00:00Z"));
    expect(result.stale).toBe(false);
    expect(result.blockers.map((item) => item.category)).toEqual(["wallet", "execution"]);
    expect(result.executionEnabled).toBe(false);
  });

  it("marks assessments older than 48 hours stale", () => {
    expect(evaluateSwapReadiness(evidence, Date.parse("2026-08-23T12:00:00Z")).stale).toBe(true);
  });
});
