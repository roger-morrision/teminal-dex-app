import type { TrackNotification } from "@/api/schema";
import { aggregateWhaleActivity, buildWhaleMarketPulse, filterWhaleEvents, filterWhaleFlows, filterWhaleWalletRankings, isWhaleActivity, whaleActivityForToken, whaleAmountContext, whaleHoldingIdentity } from "@/lib/whale-activity";

const event = (input: Partial<TrackNotification> & Pick<TrackNotification, "id" | "type">): TrackNotification => ({
  title: "Observed activity",
  message: "Provider evidence",
  tokenAddress: "11111111111111111111111111111111",
  tokenSymbol: "WHALE",
  wallet: "So11111111111111111111111111111111111111112",
  amountUsd: 0,
  observedAt: 1,
  source: "database.token_transactions",
  dataQuality: "observed",
  market: { symbol: "WHALE", imageUrl: null, sourceFetchedAt: 1, freshnessSeconds: 1, priceUsd: 1, marketCap: 1_000_000, holders: 100, volume1h: 1_000, change1h: 1 },
  ...input,
});

describe("whale activity aggregation", () => {
  it("keeps only whale and smart-money evidence", () => {
    expect(isWhaleActivity(event({ id: "w", type: "whale_buy" }))).toBe(true);
    expect(isWhaleActivity(event({ id: "k", type: "kol_buy" }))).toBe(false);
  });

  it("qualifies ownership-based whale identity only from eligible holdings at or above $10K", () => {
    const evidence = { tokenAddress: "Vote111111111111111111111111111111111111111", tokenSymbol: "ANSEM", valueUsd: 10_000, observedAt: 1, source: "provider.wallet_holdings", eligibleToken: true };
    expect(whaleHoldingIdentity(event({ id: "qualified", type: "whale_buy", observedAt: 2, whaleHolding: evidence }))).toMatchObject({ label: "ANSEM Whale", valueUsd: 10_000 });
    expect(whaleHoldingIdentity(event({ id: "small", type: "whale_buy", observedAt: 2, whaleHolding: { ...evidence, valueUsd: 9_999 } }))).toBeNull();
    expect(whaleHoldingIdentity(event({ id: "ineligible", type: "whale_buy", observedAt: 2, whaleHolding: { ...evidence, eligibleToken: false } }))).toBeNull();
    expect(whaleHoldingIdentity(event({ id: "current", type: "whale_buy", observedAt: 0, whaleHolding: evidence }))).toMatchObject({ label: "ANSEM Whale", observedAt: 1 });
  });

  it("derives net flow, direction counts, unique wallets and newest evidence", () => {
    const flows = aggregateWhaleActivity([
      event({ id: "buy", type: "whale_buy", amountUsd: 50_000, observedAt: 10 }),
      event({ id: "sell", type: "whale_sell", amountUsd: 20_000, observedAt: 20 }),
      event({ id: "smart", type: "smart_buy", amountUsd: 5_000, observedAt: 15, wallet: "Vote111111111111111111111111111111111111111" }),
      event({ id: "ignored", type: "surge", amountUsd: 1_000_000 }),
    ]);
    expect(flows).toHaveLength(1);
    expect(flows[0]).toMatchObject({ buys: 2, sells: 1, buyUsd: 55_000, sellUsd: 20_000, netUsd: 35_000, uniqueWallets: 2, latestObservedAt: 20 });
    expect(flows[0]?.events.map((item) => item.id)).toEqual(["sell", "smart", "buy"]);
  });

  it("reports missing USD evidence instead of silently claiming complete flow", () => {
    const [flow] = aggregateWhaleActivity([
      event({ id: "known", type: "whale_buy", amountUsd: 10 }),
      event({ id: "missing", type: "whale_sell", amountUsd: null }),
    ]);
    expect(flow).toMatchObject({ knownAmountCount: 1, missingAmountCount: 1, amountCoverage: 0.5, netUsd: 10 });
  });

  it("applies direction and amount controls before deterministic sorting", () => {
    const rows = [
      event({ id: "small", type: "whale_buy", amountUsd: 5_000, observedAt: 30 }),
      event({ id: "large", type: "smart_buy", amountUsd: 80_000, observedAt: 10 }),
      event({ id: "sell", type: "whale_sell", amountUsd: 100_000, observedAt: 20 }),
    ];
    expect(filterWhaleEvents(rows, { direction: "buy", minimumUsd: 10_000, sort: "largest" }).map((item) => item.id)).toEqual(["large"]);
    expect(filterWhaleEvents(rows, { direction: "all", minimumUsd: 0, sort: "latest" }).map((item) => item.id)).toEqual(["small", "sell", "large"]);
  });

  it("searches whale evidence by token, contract, or wallet without changing source data", () => {
    const rows = [
      event({ id: "token", type: "whale_buy", tokenSymbol: "BONK" }),
      event({ id: "wallet", type: "whale_sell", tokenSymbol: "WIF", wallet: "KnownWhaleWallet111111111111111111111111111" }),
    ];
    const input = { direction: "all" as const, minimumUsd: 0, sort: "latest" as const };
    expect(filterWhaleEvents(rows, { ...input, query: "bonk" }).map((item) => item.id)).toEqual(["token"]);
    expect(filterWhaleEvents(rows, { ...input, query: "knownwhale" }).map((item) => item.id)).toEqual(["wallet"]);
    expect(rows).toHaveLength(2);
  });

  it("searches aggregated flows by token identity and contributing wallet", () => {
    const flows = aggregateWhaleActivity([
      event({ id: "bonk", type: "whale_buy", tokenSymbol: "BONK", tokenAddress: "BonkMint111", wallet: "KnownWhale111" }),
      event({ id: "wif", type: "whale_sell", tokenSymbol: "WIF", tokenAddress: "WifMint222", wallet: "OtherWallet222" }),
    ]);
    expect(filterWhaleFlows(flows, " bonk ").map((flow) => flow.tokenSymbol)).toEqual(["BONK"]);
    expect(filterWhaleFlows(flows, "wifmint").map((flow) => flow.tokenSymbol)).toEqual(["WIF"]);
    expect(filterWhaleFlows(flows, "knownwhale").map((flow) => flow.tokenSymbol)).toEqual(["BONK"]);
    expect(filterWhaleFlows(flows, "missing")).toEqual([]);
    expect(filterWhaleFlows(flows)).toBe(flows);
  });

  it("searches qualified wallet rankings without changing provider order", () => {
    const rows = [
      { rank: 1, address: "KnownWhale111", pnlUsd: 500, pnlPct: 10, winRate: 60, trades: 8, tokenCount: 3, maxDrawdownPct: 12, reliability: 80, bestToken: "BONK", bestTokenPct: 20, badge: "Whale" as const, sparkline: [1, 2] },
      { rank: 2, address: "SmartWallet222", pnlUsd: 200, pnlPct: 5, winRate: 55, trades: 6, tokenCount: 2, maxDrawdownPct: 9, reliability: 70, bestToken: "WIF", bestTokenPct: 10, badge: "Smart Money" as const, sparkline: [1, 2] },
    ];
    expect(filterWhaleWalletRankings(rows, "knownwhale")).toEqual([rows[0]]);
    expect(filterWhaleWalletRankings(rows, "wif")).toEqual([rows[1]]);
    expect(filterWhaleWalletRankings(rows, "smart money")).toEqual([rows[1]]);
    expect(filterWhaleWalletRankings(rows, "missing")).toEqual([]);
    expect(filterWhaleWalletRankings(rows)).toBe(rows);
  });

  it("builds a strict newest-first token whale chronology", () => {
    const otherAddress = "Vote111111111111111111111111111111111111111";
    const rows = [
      event({ id: "older", type: "whale_buy", observedAt: 10 }),
      event({ id: "ignored-kind", type: "surge", observedAt: 40 }),
      event({ id: "other-token", type: "smart_buy", tokenAddress: otherAddress, observedAt: 30 }),
      event({ id: "newer", type: "whale_sell", observedAt: 20 }),
    ];
    expect(whaleActivityForToken(rows, rows[0]!.tokenAddress).map((item) => item.id)).toEqual(["newer", "older"]);
  });

  it("builds a truthful bounded market pulse without converting missing amounts to volume", () => {
    const pulse = buildWhaleMarketPulse([
      event({ id: "buy", type: "whale_buy", tokenSymbol: "BONK", amountUsd: 1_500_000, wallet: "wallet-a" }),
      event({ id: "sell", type: "smart_take_profit", tokenSymbol: "WIF", tokenAddress: "Vote111111111111111111111111111111111111111", amountUsd: 25_000, wallet: "wallet-b" }),
      event({ id: "missing", type: "smart_buy", amountUsd: null, wallet: "wallet-a" }),
      event({ id: "ignored", type: "kol_buy", amountUsd: 999_000 }),
    ]);
    expect(pulse).toMatchObject({ eventCount: 3, activeTokens: 2, uniqueWallets: 2, knownAmountCount: 2, missingAmountCount: 1, amountContextMismatchCount: 1, buyUsd: 1_500_000, sellUsd: 25_000, netUsd: 1_475_000, buyShare: 1_500_000 / 1_525_000 });
    expect(pulse.largestEvent?.id).toBe("buy");
  });

  it("flags amount and market-cap snapshot mismatches without deleting provider evidence", () => {
    expect(whaleAmountContext(event({ id: "high", type: "whale_buy", amountUsd: 2_000_000 }))).toBe("amount_exceeds_market_cap");
    expect(whaleAmountContext(event({ id: "bounded", type: "whale_buy", amountUsd: 500_000 }))).toBe("within_market_cap");
    expect(whaleAmountContext(event({ id: "missing", type: "whale_buy", amountUsd: null }))).toBe("amount_missing");
  });
});
