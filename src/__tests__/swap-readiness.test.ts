import { evaluateSwapEvidenceChain, evaluateSwapReadiness, isSwapQuoteExpired } from "@/lib/swap-readiness";
import type { SwapInspection, SwapSimulation, SwapV2Readiness } from "@/api/schema";

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

  it("expires quotes only after the exact fifteen-second boundary", () => {
    expect(isSwapQuoteExpired(1_000, 16_000)).toBe(false);
    expect(isSwapQuoteExpired(1_000, 16_001)).toBe(true);
  });

  it("does not treat bounded future clock skew as quote age", () => {
    expect(isSwapQuoteExpired(20_000, 19_000)).toBe(false);
  });

  it("binds policy evidence to the exact intent and wallet", () => {
    const policyHash = "a".repeat(64);
    const inspection: SwapInspection = { schema: "swap-intent-inspection-v1", executionEnabled: false, intent: { id: "intent_123", status: "inspected", expiresAt: 1, transactionHash: policyHash, messageHash: policyHash, quoteHash: policyHash }, replay: false, nextRequiredGate: "server_simulation_and_mint_amount_verification" };
    const simulation: SwapSimulation = { schema: "swap-intent-simulation-v2", executionEnabled: false, intentId: "intent_123", replay: false, simulation: { provider: "configured-helius-rpc", slot: 1, succeeded: true, error: null, logs: [], unitsConsumed: 1, simulatedAt: 1, sigVerify: false, replaceRecentBlockhash: true, resolved: { inputMint: "11111111111111111111111111111111", outputMint: "So11111111111111111111111111111111111111112", inAmount: "1", quotedOutAmount: "1", slippageBps: 1, ownerAuthorityVerified: true, mintIdentityVerified: true, amountIdentityVerified: true, swapVariant: "route" }, policyTrace: { schemaVersion: "automation-policy-trace-v1", ownerKey: "11111111111111111111111111111111", intentId: "intent_123", mode: "simulation", lease: null, checks: [{ id: "owner_bound", passed: true, observed: true }], blockers: [], policyHash, allowed: true, executionEnabled: false } }, nextRequiredGate: "explicit_owner_confirmation" };
    expect(evaluateSwapEvidenceChain({ readiness: evidence, inspection, simulation, wallet: "11111111111111111111111111111111" }).consistent).toBe(true);
    expect(evaluateSwapEvidenceChain({ readiness: evidence, inspection, simulation, wallet: "So11111111111111111111111111111111111111112" }).issues).toContain("policy_owner_mismatch");
  });
});
