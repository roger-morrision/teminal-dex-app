import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadTrackFilter,
  saveTrackFilter,
  TRACK_FILTER_KEY,
} from "@/store/track";
import { LOCAL_DATA_KEYS } from "@/settings/privacy";

describe("Track filter persistence", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });
  it("persists only supported filters and participates in privacy reset", async () => {
    await saveTrackFilter("kol");
    expect(await loadTrackFilter()).toBe("kol");
    expect(LOCAL_DATA_KEYS).toContain(TRACK_FILTER_KEY);
    await expect(saveTrackFilter("bad" as "kol")).rejects.toThrow(
      "Unsupported",
    );
  });
  it("falls back safely when storage is corrupted", async () => {
    await AsyncStorage.setItem(TRACK_FILTER_KEY, "execute");
    expect(await loadTrackFilter()).toBe("all");
  });
});
