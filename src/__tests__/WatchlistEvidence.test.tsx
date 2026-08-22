import { render } from "@testing-library/react-native";
import { WatchlistEvidence } from "../../app/(tabs)/discover";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

const address = "11111111111111111111111111111111";
const token = {
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
  sourceFetchedAt: Date.now() - 60_000,
};
const alert = {
  id: "alert-1",
  userId: address,
  chainId: "solana" as const,
  address,
  type: "price" as const,
  name: "Price",
  description: "Observed",
  conditions: {},
  channels: ["inApp" as const],
  cooldownMinutes: 60,
  active: true,
  lastTriggered: 1,
  triggerCount: 2,
  createdAt: 1,
  updatedAt: 1,
  persistence: "database" as const,
};
const delivery = {
  id: "delivery-1",
  alertId: "alert-1",
  eventKey: "event",
  channel: "inApp",
  status: "failed" as const,
  reason: "provider unavailable",
  deliveredAt: null,
  createdAt: "2026-08-22T00:00:00.000Z",
  updatedAt: "2026-08-22T00:01:00.000Z",
};

describe("WatchlistEvidence", () => {
  it("shows market provenance and requires verified ownership for alert status", async () => {
    const screen = await render(
      <SettingsProvider>
        <WatchlistEvidence
          token={token}
          authorized={false}
          loading={false}
          alerts={[]}
          deliveries={[]}
        />
      </SettingsProvider>,
    );
    expect(screen.getByText(/provider · live · observed 1m ago/i)).toBeTruthy();
    expect(screen.getByText(/Verify and unlock your wallet/i)).toBeTruthy();
  });
  it("joins durable owner rules to their latest delivery outcome and reason", async () => {
    const screen = await render(
      <SettingsProvider>
        <WatchlistEvidence
          token={token}
          authorized
          loading={false}
          alerts={[alert]}
          deliveries={[delivery]}
        />
      </SettingsProvider>,
    );
    expect(
      screen.getByText(
        /Alerts 1\/1 active · 2 triggers · latest delivery failed/i,
      ),
    ).toBeTruthy();
    expect(screen.getByText("provider unavailable")).toBeTruthy();
  });
});
