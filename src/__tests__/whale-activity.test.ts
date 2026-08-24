import type { TrackNotification } from "@/api/schema";
import { aggregateWhaleActivity, filterWhaleEvents, isWhaleActivity } from "@/lib/whale-activity";

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
});
