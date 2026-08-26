import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import SettingsScreen, { ResetControl } from "../../app/settings";
import { boundedTradeAmount, QuoteTokenState, ReadinessFailure } from "../../app/trade/[address]";
import { SettingsProvider } from "@/settings/SettingsProvider";
import { clearLocalAppData } from "@/settings/privacy";

const mockDisconnect = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({ back: jest.fn() }),
}));
jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: () => ({ disconnect: mockDisconnect }),
}));
jest.mock("@/settings/privacy", () => ({
  clearLocalAppData: jest.fn(),
}));

describe("one-off asynchronous surfaces", () => {
  it("bounds quote amounts before they can enter request state", () => {
    expect(boundedTradeAmount("$123456789012345.123456789")).toBe("123456789012.123456");
    expect(boundedTradeAmount("1..2e+3")).toBe("1.23");
    expect(boundedTradeAmount("-0.5")).toBe("0.5");
  });
  it("exposes quote token loading and failures distinctly", async () => {
    const screen = await render(
      <SettingsProvider>
        <QuoteTokenState loading text="Loading token identity" />
      </SettingsProvider>,
    );
    expect(screen.getByRole("summary").props.accessibilityState).toEqual({
      busy: true,
    });

    await screen.rerender(
      <SettingsProvider>
        <QuoteTokenState loading={false} text="Provider failed" />
      </SettingsProvider>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("guards quote token identity recovery while refetching", async () => {
    const retry = jest.fn();
    const screen = await render(
      <SettingsProvider>
        <QuoteTokenState
          loading={false}
          text="Provider failed"
          retrying
          onRetry={retry}
        />
      </SettingsProvider>,
    );
    const button = screen.getByLabelText("Retry");
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    await fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();
  });

  it("guards provider readiness recovery while refetching", async () => {
    const retry = jest.fn();
    const screen = await render(
      <SettingsProvider>
        <ReadinessFailure retrying onRetry={retry} />
      </SettingsProvider>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    const button = screen.getByLabelText("Retry");
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    await fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();
  });

  it("exposes reset busy and outcome states", async () => {
    const screen = await render(
      <ResetControl
        clearing
        error=""
        status=""
        label="Clear local data"
        clearingLabel="Clearing"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByRole("button").props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });

    await screen.rerender(
      <ResetControl
        clearing={false}
        error="Reset failed"
        status=""
        label="Clear local data"
        clearingLabel="Clearing"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toBeTruthy();

    await screen.rerender(
      <ResetControl
        clearing={false}
        error=""
        status="Reset complete"
        label="Clear local data"
        clearingLabel="Clearing"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByRole("summary")).toBeTruthy();
  });

  it("recovers visibly when local reset fails", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockDisconnect.mockResolvedValue(undefined);
    jest.mocked(clearLocalAppData).mockRejectedValueOnce(new Error("storage"));
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const screen = await render(
      <QueryClientProvider client={client}>
        <SettingsProvider>
          <SettingsScreen />
        </SettingsProvider>
      </QueryClientProvider>,
    );

    await fireEvent.press(
      screen.getByLabelText("Disconnect and clear local data"),
    );
    const buttons = jest.mocked(Alert.alert).mock.calls[0]?.[2];
    const destructive = buttons?.find(
      (button) => button.style === "destructive",
    );
    await act(async () => destructive?.onPress?.());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Could not finish clearing all local data/,
    );
    expect(
      screen.getByLabelText("Disconnect and clear local data").props
        .accessibilityState,
    ).toEqual({ disabled: false, busy: false });
  });
});
