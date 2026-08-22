import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrategyComposer } from "../../app/copytrade";
import { createPausedCopyTradeConfig } from "@/api/client";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@/api/client", () => ({
  ...jest.requireActual("@/api/client"),
  createPausedCopyTradeConfig: jest.fn(),
}));
jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

const trader = {
  rank: 1,
  address: "11111111111111111111111111111111",
  pnlUsd: 5,
  pnlPct: 2,
  winRate: 50,
  trades: 20,
  bestToken: "SOL",
  bestTokenPct: 2,
  badge: "Smart Money",
  sparkline: [],
};

describe("StrategyComposer", () => {
  it("submits reviewed durable fields paused and never exposes an activation action", async () => {
    jest.mocked(createPausedCopyTradeConfig).mockResolvedValue({} as never);
    const onCreated = jest.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <StrategyComposer
            trader={trader}
            onClose={jest.fn()}
            onCreated={onCreated}
          />
        </SettingsProvider>
      </QueryClientProvider>,
    );
    await fireEvent.changeText(
      screen.getByLabelText("MIN LIQUIDITY (USD)"),
      "25000",
    );
    await fireEvent.press(screen.getByLabelText("Only new launches"));
    await fireEvent.press(
      screen.getByLabelText("Save paused CopyTrade strategy"),
    );
    await waitFor(() =>
      expect(
        jest.mocked(createPausedCopyTradeConfig).mock.calls[0]?.[0],
      ).toEqual(
        expect.objectContaining({
          isActive: false,
          minLiquidityUsd: 25_000,
          onlyNewLaunches: true,
          stopLossPct: 20,
          takeProfitPct: 50,
          maxSlippageBps: 100,
        }),
      ),
    );
    expect(screen.queryByRole("button", { name: /activate/i })).toBeNull();
    screen.unmount();
    queryClient.clear();
  });
});
