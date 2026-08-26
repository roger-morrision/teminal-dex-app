import type { MarketToken } from "@/api/schema";
import {
  applyTrenchFilters,
  boundedKeyword,
  boundedNumber,
  emptyTrenchFilters,
  normalizeTrenchDex,
  trenchLaunchpads,
  trenchFilterCount,
} from "@/lib/trenches";

const token = (overrides: Partial<MarketToken>): MarketToken => ({
  id: "pair",
  symbol: "DEX",
  name: "Terminal",
  address: "mintaddress",
  pairAddress: "pair",
  dex: "pumpfun",
  quoteSymbol: "SOL",
  price: 1,
  marketCap: 60_000,
  liquidity: 5,
  volume24h: 30_000,
  volume1h: 2,
  change24h: 3,
  change1h: 1,
  txns5m: { buys: 4, sells: 2 },
  ageLabel: "10m",
  ageMinutes: 10,
  bondingProgress: 87,
  ...overrides,
});

describe("Trenches filters", () => {
  it("normalizes, deduplicates, reserves All, and caps provider DEX controls", () => {
    const values = trenchLaunchpads([
      { dex: undefined },
      { dex: "  " },
      { dex: "All" },
      { dex: " Raydium " },
      { dex: "raydium" },
      ...Array.from({ length: 12 }, (_, index) => ({ dex: `dex-${index}` })),
    ]);
    expect(values).toEqual(["All", "Raydium", "dex-0", "dex-1", "dex-2", "dex-3", "dex-4", "dex-5", "dex-6"]);
    expect(normalizeTrenchDex(undefined)).toBeNull();
    expect(normalizeTrenchDex("  orca  ")).toBe("orca");
  });
  it("combines launchpad, keyword and authoritative metric thresholds", () => {
    const rows = [
      token({ id: "match" }),
      token({ id: "wrong-dex", dex: "orca" }),
      token({ id: "old", ageMinutes: 120 }),
    ];
    expect(
      applyTrenchFilters(rows, {
        keyword: "terminal",
        launchpad: "pumpfun",
        minMarketCap: "50000",
        minVolume24h: "25000",
        maxAgeMinutes: "60",
        minBondingProgress: "80",
      }).map((row) => row.id),
    ).toEqual(["match"]);
  });
  it("does not treat a missing market cap or bonding metric as zero evidence", () => {
    expect(
      applyTrenchFilters(
        [
          token({
            marketCap: null,
            bondingProgress: null,
            progress: undefined,
          }),
        ],
        { ...emptyTrenchFilters, minMarketCap: "1" },
      ),
    ).toHaveLength(0);
    expect(
      applyTrenchFilters(
        [
          token({
            marketCap: null,
            bondingProgress: null,
            progress: undefined,
          }),
        ],
        { ...emptyTrenchFilters, minBondingProgress: "1" },
      ),
    ).toHaveLength(0);
  });
  it("fails soft when provider DEX evidence is missing", () => {
    const missingDex = token({ dex: undefined as unknown as string });
    expect(applyTrenchFilters([missingDex], emptyTrenchFilters)).toEqual([missingDex]);
    expect(
      applyTrenchFilters([missingDex], {
        ...emptyTrenchFilters,
        launchpad: "raydium",
      }),
    ).toEqual([]);
  });
  it("bounds text inputs and reports active criteria", () => {
    expect(boundedKeyword(`abc\u0000${"x".repeat(60)}`)).toHaveLength(50);
    expect(boundedNumber("12.3x4.567")).toBe("12.34");
    expect(boundedNumber("101", 100)).toBe("100");
    expect(boundedNumber("99.75", 100)).toBe("99.75");
    expect(
      trenchFilterCount({
        ...emptyTrenchFilters,
        keyword: "DEX",
        maxAgeMinutes: "60",
      }),
    ).toBe(2);
  });
});
