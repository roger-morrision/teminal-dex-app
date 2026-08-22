import { fireEvent, render } from "@testing-library/react-native";
import { SocialTrendCard, TrackEventCard } from "../../app/track";
import { SettingsProvider } from "@/settings/SettingsProvider";
import type { SocialRadarTrend, TrackNotification } from "@/api/schema";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));
const address = "11111111111111111111111111111111";
const item: TrackNotification = {
  id: "whale:signature",
  type: "whale_buy",
  title: "Whale buy",
  message: "Observed provider transaction",
  tokenAddress: address,
  tokenSymbol: "SOL",
  wallet: address,
  amountUsd: 25000,
  observedAt: 1_787_369_431_000,
  source: "database.token_transactions",
  dataQuality: "holder-classified-whale",
  txHash: "signature",
  market: {
    symbol: "SOL",
    imageUrl: null,
    sourceFetchedAt: 1_787_369_430_000,
    freshnessSeconds: 1,
    priceUsd: 1,
    marketCap: 10,
    holders: 2,
    volume1h: 3,
    change1h: 4,
  },
};

describe("Track event evidence", () => {
  it("shows source, quality, and dedupe identity with exact-mint navigation only", async () => {
    const onOpen = jest.fn();
    const screen = await render(
      <SettingsProvider>
        <TrackEventCard item={item} onOpen={onOpen} />
      </SettingsProvider>,
    );
    expect(
      screen.getByText(
        /database\.token_transactions · holder-classified-whale/,
      ),
    ).toBeTruthy();
    expect(screen.getByText("dedupe whale:signature")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/execute|subscribe|follow wallet/i)).toBeNull();
  });
  it("renders bounded provider social evidence with exact-mint navigation and no external action", async () => {
    const onOpen = jest.fn();
    const social = {
      token: { address, symbol: "SOL", name: "Solana" },
      trend: {
        tokenAddress: address,
        providers: ["x-api", "telegram"],
        postCount: 3,
        uniqueAuthors: 2,
        socialTrendScore: 70,
        trendState: "accelerating",
        observedAt: 1_787_369_431_000,
        freshness: "fresh",
        marketConfirmation: "unconfirmed",
        warnings: ["single_social_provider"],
      },
      evidence: [{ provider: "x-api", externalId: "post-1", text: "Provider-backed social observation" }],
    } as SocialRadarTrend;
    const screen = await render(
      <SettingsProvider>
        <SocialTrendCard item={social} onOpen={onOpen} />
      </SettingsProvider>,
    );
    expect(screen.getByText("3 posts · 2 authors · score 70")).toBeTruthy();
    expect(screen.getByText(/x-api · Provider-backed social observation/)).toBeTruthy();
    await fireEvent.press(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/follow|publish|open x|open telegram/i)).toBeNull();
  });
});
