import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  WHALE_WATCH_PREFERENCES_KEY,
  defaultWhaleWatchPreferences,
  loadWhaleWatchPreferences,
  saveWhaleWatchPreferences,
} from "@/store/whale-watch";

describe("Whale Watch preferences", () => {
  beforeEach(() => AsyncStorage.clear());

  it("round-trips only supported non-secret view controls", async () => {
    await saveWhaleWatchPreferences({ mode: "accumulating", direction: "buy", minimumUsd: 25_000, sort: "largest" });
    expect(await loadWhaleWatchPreferences()).toEqual({ mode: "accumulating", direction: "buy", minimumUsd: 25_000, sort: "largest" });
  });

  it("fails closed to safe defaults for hostile or incompatible storage", async () => {
    await AsyncStorage.setItem(WHALE_WATCH_PREFERENCES_KEY, JSON.stringify({ mode: "trade", direction: "execute", minimumUsd: 999_999, sort: "profit", query: "private-wallet-search" }));
    expect(await loadWhaleWatchPreferences()).toEqual(defaultWhaleWatchPreferences);
    await AsyncStorage.setItem(WHALE_WATCH_PREFERENCES_KEY, "not-json");
    expect(await loadWhaleWatchPreferences()).toEqual(defaultWhaleWatchPreferences);
  });
});
