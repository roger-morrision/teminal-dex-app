import { render } from "@testing-library/react-native";
import { State as AiState } from "../../app/ai";
import { State as CopyTradeState } from "../../app/copytrade";
import { State as MarketIntelligenceState } from "../../app/market-intelligence";
import { State as OperationsState } from "../../app/operations";
import { State as ResearchState } from "../../app/research-workspace";
import { State as WalletIntelligenceState } from "../../app/wallet-intelligence";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

const states = [
  ["AI", AiState],
  ["CopyTrade", CopyTradeState],
  ["market intelligence", MarketIntelligenceState],
  ["operations", OperationsState],
  ["research", ResearchState],
  ["wallet intelligence", WalletIntelligenceState],
] as const;

describe.each(states)("%s dynamic state", (_name, State) => {
  it("announces loading, errors, and empty evidence distinctly", async () => {
    const screen = await render(<State loading text="Loading evidence" />);
    const loading = screen.getByRole("summary");
    expect(loading.props.accessibilityLiveRegion).toBe("polite");
    expect(loading.props.accessibilityState).toEqual({ busy: true });

    await screen.rerender(<State error text="Provider failed" />);
    expect(screen.getByRole("alert")).toBeTruthy();

    await screen.rerender(<State text="No evidence" />);
    expect(
      screen.getByRole("summary").props.accessibilityState,
    ).toBeUndefined();
  });
});
