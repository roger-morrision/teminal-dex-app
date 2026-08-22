import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrategyComposer } from "../../app/copytrade";
import { createPausedCopyTradeConfig } from "@/api/client";
import { SettingsProvider } from "@/settings/SettingsProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  beforeEach(() => AsyncStorage.clear());

  it("submits durable fields paused while keeping local safety preview values out of the request", async () => {
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
    await fireEvent.changeText(
      screen.getByLabelText("PRIORITY FEE SOL (0–0.01)"),
      "0.005",
    );
    await fireEvent.changeText(
      screen.getByLabelText("MINIMUM HOLDERS"),
      "250",
    );
    await fireEvent.changeText(
      screen.getByLabelText("TRAILING STOP (%)"),
      "12",
    );
    await fireEvent.press(
      screen.getByLabelText("Save paused CopyTrade strategy"),
    );
    const submitted = jest.mocked(createPausedCopyTradeConfig).mock.calls[0]?.[0];
    expect(submitted).not.toHaveProperty("priorityFeeSol");
    expect(submitted).not.toHaveProperty("minHolderCount");
    expect(submitted).not.toHaveProperty("antiMev");
    expect(submitted).not.toHaveProperty("trailingStopPct");
    expect(submitted).not.toHaveProperty("exitLadder");
    expect(screen.getByText(/Priority 0.005 SOL · holders ≥ 250/)).toBeTruthy();
    expect(
      screen.getByText(/not included in the backend strategy request/),
    ).toBeTruthy();
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
