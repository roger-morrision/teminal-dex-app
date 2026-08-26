import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MarketToken } from "@/api/schema";
import {
  MONITOR_TABLE_KEY,
  defaultMonitorTablePreferences,
  filterAndSortMonitorTokens,
  loadMonitorTablePreferences,
  monitorTableActiveFilters,
  monitorDexOptions,
  normalizeMonitorDex,
  saveMonitorTablePreferences,
  sanitizeMonitorTablePreferences,
  toggleMonitorSort,
} from "@/store/monitor-table";

const addressA = "11111111111111111111111111111111";
const addressB = "11111111111111111111111111111112";
const token = (overrides: Partial<MarketToken>): MarketToken => ({
  id: overrides.address ?? addressA,
  symbol: "DEX",
  name: "Terminal",
  address: addressA,
  pairAddress: "pair",
  dex: "raydium",
  quoteSymbol: "SOL",
  price: 1,
  marketCap: 100,
  liquidity: 50,
  volume24h: 200,
  volume1h: 20,
  change24h: 3,
  change1h: 1,
  txns5m: { buys: 2, sells: 1 },
  ageLabel: "1h",
  ageMinutes: 60,
  ...overrides,
});

describe("Monitor token table preferences", () => {
  beforeEach(() => AsyncStorage.clear());

  it("sanitizes persisted controls and bounds unique multi-sort priorities", () => {
    expect(
      sanitizeMonitorTablePreferences({
        window: "execute",
        preset: "hidden",
        density: "tiny",
        query: "x".repeat(100),
        dex: "RAYDIUM",
        minLiquidity: "-1",
        minMarketCap: "1e99",
        minVolume: "100.25",
        sorts: [
          { key: "liquidity", direction: "asc" },
          { key: "liquidity", direction: "desc" },
          { key: "marketCap", direction: "desc" },
          { key: "execute", direction: "desc" },
        ],
      }),
    ).toMatchObject({
      window: "1h",
      preset: "market",
      density: "compact",
      query: "x".repeat(80),
      dex: "raydium",
      minLiquidity: "0",
      minMarketCap: "0",
      minVolume: "100.25",
      sorts: [
        { key: "liquidity", direction: "asc" },
        { key: "marketCap", direction: "desc" },
      ],
    });
  });

  it("round-trips supported preferences and safely recovers corrupted storage", async () => {
    const value = { ...defaultMonitorTablePreferences, window: "24h" as const, density: "comfortable" as const };
    await saveMonitorTablePreferences(value);
    expect(await loadMonitorTablePreferences()).toEqual(value);
    await AsyncStorage.setItem(MONITOR_TABLE_KEY, "not-json");
    expect(await loadMonitorTablePreferences()).toEqual(defaultMonitorTablePreferences);
  });

  it("combines exact evidence filters and does not zero-fill missing market cap", () => {
    const preferences = {
      ...defaultMonitorTablePreferences,
      query: "dex",
      dex: "raydium",
      direction: "positive" as const,
      minLiquidity: "40",
      minMarketCap: "90",
      minVolume: "10",
    };
    const rows = filterAndSortMonitorTokens(
      [
        token({ address: addressA, change1h: 2 }),
        token({ address: addressB, marketCap: null, change1h: 4 }),
        token({ address: "11111111111111111111111111111113", change1h: -2 }),
      ],
      preferences,
    );
    expect(rows.map((item) => item.address)).toEqual([addressA]);
    expect(monitorTableActiveFilters(preferences)).toBe(6);
  });

  it("normalizes provider DEX evidence before deduplication and limiting", () => {
    const tokens = [
      token({ dex: " Raydium " }),
      token({ address: addressB, dex: "raydium" }),
      token({ address: "11111111111111111111111111111113", dex: "All" }),
      token({ address: "11111111111111111111111111111114", dex: "  " }),
      token({
        address: "11111111111111111111111111111115",
        dex: undefined as never,
      }),
      token({ address: "11111111111111111111111111111116", dex: "Orca" }),
    ];
    expect(monitorDexOptions(tokens)).toEqual(["Orca", "Raydium"]);
    expect(monitorDexOptions(tokens, 1)).toEqual(["Orca"]);
    expect(normalizeMonitorDex(undefined)).toBeNull();
    expect(normalizeMonitorDex(" all ")).toBeNull();
  });

  it("filters malformed runtime DEX evidence without throwing", () => {
    const malformed = token({ dex: undefined as never });
    expect(
      filterAndSortMonitorTokens([malformed], defaultMonitorTablePreferences),
    ).toEqual([malformed]);
    expect(
      filterAndSortMonitorTokens([malformed], {
        ...defaultMonitorTablePreferences,
        dex: "raydium",
      }),
    ).toEqual([]);
  });

  it("applies stable two-level sorting and cycles desc, asc, then removal", () => {
    const rows = filterAndSortMonitorTokens(
      [
        token({ address: addressA, change1h: 5, liquidity: 20 }),
        token({ address: addressB, change1h: 5, liquidity: 40 }),
      ],
      {
        ...defaultMonitorTablePreferences,
        sorts: [
          { key: "change1h", direction: "desc" },
          { key: "liquidity", direction: "desc" },
        ],
      },
    );
    expect(rows.map((item) => item.address)).toEqual([addressB, addressA]);
    const added = toggleMonitorSort([], "volume1h");
    expect(added).toEqual([{ key: "volume1h", direction: "desc" }]);
    expect(toggleMonitorSort(added, "volume1h")).toEqual([
      { key: "volume1h", direction: "asc" },
    ]);
    expect(toggleMonitorSort([{ key: "volume1h", direction: "asc" }], "volume1h")).toEqual(
      defaultMonitorTablePreferences.sorts,
    );
  });
});
