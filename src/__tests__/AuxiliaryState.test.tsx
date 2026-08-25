import { fireEvent, render } from "@testing-library/react-native";
import { State as AiState } from "../../app/ai";
import { State as CopyTradeState } from "../../app/copytrade";
import { State as MarketIntelligenceState } from "../../app/market-intelligence";
import { InlineWarning as OperationsWarning, State as OperationsState } from "../../app/operations";
import { State as ResearchState } from "../../app/research-workspace";
import { InlineEvidenceFailure, State as WalletIntelligenceState } from "../../app/wallet-intelligence";
import { State as TrackState } from "../../app/track";
import { SettingsProvider } from "@/settings/SettingsProvider";

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
  ["Track", TrackState],
] as const;

describe.each(states)("%s dynamic state", (_name, State) => {
  it("announces loading, errors, and empty evidence distinctly", async () => {
    const screen = await render(<SettingsProvider><State loading text="Loading evidence" /></SettingsProvider>);
    const loading = screen.getByRole("summary");
    expect(loading.props.accessibilityLiveRegion).toBe("polite");
    expect(loading.props.accessibilityState).toEqual({ busy: true });

    await screen.rerender(<SettingsProvider><State error text="Provider failed" /></SettingsProvider>);
    expect(screen.getByRole("alert")).toBeTruthy();

    await screen.rerender(<SettingsProvider><State text="No evidence" /></SettingsProvider>);
    expect(
      screen.getByRole("summary").props.accessibilityState,
    ).toBeUndefined();
  });
});

it("guards Track recovery while refetching", async () => {
  const retry = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <TrackState error text="Provider failed" retrying onRetry={retry} />
    </SettingsProvider>,
  );
  const button = screen.getByLabelText("Retry tracking evidence");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();
});

it("guards market-intelligence recovery and omits inert actions", async () => {
  const retry = jest.fn();
  const screen = await render(
    <MarketIntelligenceState
      error
      text="Provider failed"
      action="Retry"
      actionBusy
      onAction={retry}
    />,
  );
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();

  await screen.rerender(
    <MarketIntelligenceState text="No evidence" action="Retry" />,
  );
  expect(screen.queryByLabelText("Retry")).toBeNull();
});

it("guards wallet-intelligence recovery and omits inert actions", async () => {
  const retry = jest.fn();
  const screen = await render(
    <WalletIntelligenceState
      error
      text="Provider failed"
      action="Retry"
      actionBusy
      onAction={retry}
    />,
  );
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();

  await screen.rerender(
    <WalletIntelligenceState text="No evidence" action="Retry" />,
  );
  expect(screen.queryByLabelText("Retry")).toBeNull();
});

it("guards partial wallet PnL recovery while preserving its alert", async () => {
  const retry = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <InlineEvidenceFailure message="PnL unavailable" retrying onRetry={retry} />
    </SettingsProvider>,
  );
  expect(screen.getByRole("alert")).toBeTruthy();
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();
});

it("guards AI evidence recovery and omits inert actions", async () => {
  const retry = jest.fn();
  const screen = await render(
    <AiState error text="Provider failed" action="Retry" actionBusy onAction={retry} />,
  );
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();

  await screen.rerender(<AiState text="No evidence" action="Retry" />);
  expect(screen.queryByLabelText("Retry")).toBeNull();
});

it("guards research chart recovery and omits inert actions", async () => {
  const retry = jest.fn();
  const screen = await render(
    <ResearchState error text="Chart failed" action="Retry" actionBusy onAction={retry} />,
  );
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();

  await screen.rerender(<ResearchState text="No chart" action="Retry" />);
  expect(screen.queryByLabelText("Retry")).toBeNull();
});

it("guards operations recovery and omits inert actions", async () => {
  const retry = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <OperationsState error text="Provider failed" action="Retry" actionBusy onAction={retry} />
    </SettingsProvider>,
  );
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();

  await screen.rerender(
    <SettingsProvider><OperationsState text="No evidence" action="Retry" /></SettingsProvider>,
  );
  expect(screen.queryByLabelText("Retry")).toBeNull();
});

it("guards partial operations recovery while preserving its alert", async () => {
  const retry = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <OperationsWarning text="Feed unavailable" retrying onRetry={retry} />
    </SettingsProvider>,
  );
  expect(screen.getByRole("alert")).toBeTruthy();
  const button = screen.getByLabelText("Retry");
  expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(retry).not.toHaveBeenCalled();
});
