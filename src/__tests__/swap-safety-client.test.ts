import { confirmVerifiedSwapIntent, prepareVerifiedSwapIntent } from "@/api/client";
import type { SwapQuoteResponse } from "@/api/schema";
import { swapConfirmationSchema, swapSimulationSchema } from "@/api/schema";

const owner = "11111111111111111111111111111111";
const mint = "So11111111111111111111111111111111111111112";
const hash = "a".repeat(64);
const quote = { quotedAt: 1_800_000_000_000, ts: 1_800_000_000_000, jupQuote: { inputMint: owner, outputMint: mint }, quote: { side: "buy", token: { address: mint, symbol: "DEX", name: "Terminal", price: 1 }, inputMint: owner, outputMint: mint, inAmount: "123", inAmountUi: 1, inAmountUiExact: "1", inSymbol: "SOL", outAmount: "456", outAmountUi: 2, outAmountUiExact: "2", outSymbol: "DEX", minOutAmount: "450", minOutUi: 1.9, minOutUiExact: "1.9", priceImpactPct: 0.1, slippageBps: 100, swapUsdValue: 1, route: ["Jupiter"], contextSlot: 42, real: true } } as SwapQuoteResponse;

describe("verified unsigned swap client", () => {
  beforeAll(() => { process.env.EXPO_PUBLIC_API_URL = "https://terminal.test"; });
  it("builds, inspects, simulates, and explicitly confirms without signing or submitting", async () => {
    const responses = [
      { swapTransaction: "A".repeat(16), lastValidBlockHeight: 9, prioritizationFeeLamports: 0, simulationError: null, builtAt: 1 },
      { schema: "swap-intent-inspection-v1", executionEnabled: false, intent: { id: "intent_123", status: "inspected", expiresAt: 2, transactionHash: hash, quoteHash: hash }, replay: false, nextRequiredGate: "server_simulation_and_mint_amount_verification" },
      { schema: "swap-intent-simulation-v1", executionEnabled: false, intentId: "intent_123", replay: false, simulation: { provider: "configured-helius-rpc", slot: 7, succeeded: true, error: null, logs: [], unitsConsumed: 10, simulatedAt: 1, sigVerify: false, replaceRecentBlockhash: true, resolved: { inputMint: owner, outputMint: mint, inAmount: "123", quotedOutAmount: "456", slippageBps: 100, ownerAuthorityVerified: true, mintIdentityVerified: true, amountIdentityVerified: true, swapVariant: "route" } }, nextRequiredGate: "explicit_owner_confirmation" },
      { schema: "swap-intent-confirmation-v1", executionEnabled: false, replay: false, intent: { id: "intent_123", status: "confirmed", confirmedAt: 3, confirmationHash: hash }, nextRequiredGate: "wallet_signature_and_managed_submission" },
    ];
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => responses.shift() })) as jest.Mock;
    const prepared = await prepareVerifiedSwapIntent(quote, owner);
    await confirmVerifiedSwapIntent(quote, prepared, owner);
    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls.map(([url]) => String(url))).toEqual(expect.arrayContaining([expect.stringContaining("/api/swap/build"), expect.stringContaining("/api/swap/intents/inspect"), expect.stringContaining("/api/swap/intents/simulate"), expect.stringContaining("/api/swap/intents/confirm")]));
    expect(calls.some(([url]) => /submit|send|sign/.test(String(url)))).toBe(false);
    expect(JSON.parse(calls[3][1].body).acknowledgement).toBe("I_CONFIRM_SIMULATED_UNSIGNED_SWAP");
  });

  it("rejects forged execution authority and unverified resolved evidence", () => {
    const simulation = { schema: "swap-intent-simulation-v1", executionEnabled: true, intentId: "intent_123", replay: false, simulation: { provider: "configured-helius-rpc", slot: 7, succeeded: true, error: null, logs: [], unitsConsumed: 10, simulatedAt: 1, sigVerify: false, replaceRecentBlockhash: true, resolved: { inputMint: owner, outputMint: mint, inAmount: "123", quotedOutAmount: "456", slippageBps: 100, ownerAuthorityVerified: true, mintIdentityVerified: false, amountIdentityVerified: true, swapVariant: "route" } }, nextRequiredGate: "explicit_owner_confirmation" };
    expect(swapSimulationSchema.safeParse(simulation).success).toBe(false);
    expect(swapConfirmationSchema.safeParse({ schema: "swap-intent-confirmation-v1", executionEnabled: true, replay: false, intent: { id: "intent_123", status: "confirmed", confirmedAt: 3, confirmationHash: hash }, nextRequiredGate: "wallet_signature_and_managed_submission" }).success).toBe(false);
  });
});
