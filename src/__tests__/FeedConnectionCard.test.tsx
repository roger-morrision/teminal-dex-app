import { render } from "@testing-library/react-native";
import { FeedConnectionCard, FeedRuntimeRecovery } from "../../app/operations";
import type { FeedConnectionsResponse } from "@/api/schema";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("FeedConnectionCard", () => {
  it("labels configuration separately from observed delivery and persistence", async () => {
    const screen = await render(
      <SettingsProvider>
        <FeedConnectionCard
          item={{
            id: "provider",
            label: "Provider",
            method: "api",
            status: "available",
            health: "degraded",
            receiving: false,
            deliveryStatus: "stale_persisted",
            configured: true,
            rateLimit: null,
            subscription: null,
            records: {
              pairs: 2,
              transactions: 3,
              candles: 4,
              total: 9,
              lastPersistedAt: Date.now() - 130_000,
              persistenceAgeMs: 130_000,
              freshness: "stale",
            },
          }}
        />
      </SettingsProvider>,
    );
    expect(
      screen.getByLabelText("Provider, degraded, 9 persisted records"),
    ).toBeTruthy();
    expect(screen.getByText(/stale persisted · configured/i)).toBeTruthy();
    expect(screen.getByText(/stale · 2m ago/i)).toBeTruthy();
  });
  it("shows subscription, runtime failure, and provider cooldown evidence", async () => {
    const screen = await render(
      <SettingsProvider>
        <FeedConnectionCard
          item={{
            id: "rpc",
            label: "Solana RPC",
            method: "rpc",
            status: "disconnected",
            health: "degraded",
            receiving: false,
            deliveryStatus: "requested_without_persisted_records",
            configured: true,
            records: {
              pairs: 0,
              transactions: 0,
              candles: 0,
              total: 0,
              lastPersistedAt: null,
              persistenceAgeMs: null,
              freshness: "unavailable",
            },
            subscription: { connected: false, count: 0, receiving: false },
            runtime: {
              connected: false,
              recordCount: 4,
              lastSuccessAt: null,
              lastError: "subscription_ack_timeout",
            },
            rateLimit: {
              minIntervalMs: 150,
              cooldownRemainingMs: 4000,
              cooldownUntil: Date.now() + 4000,
              coolingDown: true,
              queuedRequests: 2,
              requests: 8,
              rateLimited: 1,
              lastRequestAt: null,
              lastRateLimitedAt: null,
              lastRetryAfterMs: 4000,
            },
          }}
        />
      </SettingsProvider>,
    );
    expect(
      screen.getByText(/Connected no · subscriptions 0 · receiving no/i),
    ).toBeTruthy();
    expect(screen.getByText(/provider timed out/i)).toBeTruthy();
    expect(screen.queryByText(/subscription_ack_timeout/i)).toBeNull();
    expect(
      screen.getByText(/Requests 8 · limited 1 · queued 2 · cooldown 4s/i),
    ).toBeTruthy();
  });
  it("renders decode and persistence evidence with a sampled delta", async () => {
    const response = {
      runtime: {
        eventBus: {
          published: 20,
          persisted: 18,
          droppedDuplicates: 1,
          droppedInvalidTimestamps: 1,
          persistFailures: 2,
          persistenceDrops: 1,
          pendingPersistence: 3,
          lastEventAt: null,
        },
        onchainTicks: {
          received: 10,
          decoded: 8,
          persisted: 7,
          dropped: 1,
          ignored: 1,
          failed: 0,
          expired: 0,
          unmatched: 1,
          quality: "degraded",
          cooldownRemainingMs: 0,
        },
      },
    } as FeedConnectionsResponse;
    const screen = await render(
      <SettingsProvider>
        <FeedRuntimeRecovery
          response={response}
          counters={{
            received: 10,
            decoded: 8,
            persisted: 7,
            dropped: 1,
            ignored: 1,
          }}
          delta={{
            received: 3,
            decoded: 2,
            persisted: 2,
            dropped: 1,
            ignored: 0,
          }}
        />
      </SettingsProvider>,
    );
    expect(screen.getByText("10 · +3")).toBeTruthy();
    expect(
      screen.getByText(/Published 20 · persisted 18 · duplicate drops 1/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Persist failures 2 · pressure drops 1 · pending 3/i),
    ).toBeTruthy();
  });
});
