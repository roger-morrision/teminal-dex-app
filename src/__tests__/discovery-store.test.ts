import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  WATCHLIST_SNAPSHOTS_KEY,
  WATCHLIST_WINDOW_KEY,
  loadWatchlist,
  loadWatchlistSnapshots,
  loadWatchlistWindow,
  saveWatchlist,
  saveWatchlistSnapshots,
  saveWatchlistWindow,
} from "@/store/discovery";
import type { MarketToken } from "@/api/schema";

const address = "11111111111111111111111111111111";
const token: MarketToken = {
  id: "pair",
  symbol: "DEX",
  name: "Terminal",
  address,
  pairAddress: "pair",
  dex: "raydium",
  quoteSymbol: "SOL",
  price: 1,
  marketCap: 10,
  liquidity: 5,
  volume24h: 4,
  volume1h: 2,
  change24h: 3,
  change1h: 1,
  txns5m: { buys: 1, sells: 0 },
  ageLabel: "1h",
  ageMinutes: 60,
  source: "provider",
  dataQuality: "live",
  sourceFetchedAt: 1,
};

describe("durable discovery watchlist", () => {
  beforeEach(() => AsyncStorage.clear());
  it("sanitizes, deduplicates, and bounds exact Solana addresses", async () => {
    await saveWatchlist([address, "bad", address]);
    expect(await loadWatchlist()).toEqual([address]);
  });
  it("loads only validated identity-matched public token snapshots", async () => {
    await saveWatchlistSnapshots({ [address]: token });
    await AsyncStorage.setItem(
      WATCHLIST_SNAPSHOTS_KEY,
      JSON.stringify({
        [address]: token,
        bad: token,
        ["11111111111111111111111111111112"]: token,
      }),
    );
    expect(await loadWatchlistSnapshots()).toEqual({ [address]: token });
  });
  it("persists only supported market windows and falls back safely", async () => {
    await saveWatchlistWindow("6h");
    expect(await loadWatchlistWindow()).toBe("6h");
    await AsyncStorage.setItem(WATCHLIST_WINDOW_KEY, "execute");
    expect(await loadWatchlistWindow()).toBe("24h");
  });
});
