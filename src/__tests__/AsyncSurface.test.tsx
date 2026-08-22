import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import SettingsScreen, { ResetControl } from "../../app/settings";
import { QuoteTokenState } from "../../app/trade/[address]";
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
  it("exposes quote token loading and failures distinctly", async () => {
    const screen = await render(
      <QuoteTokenState loading text="Loading token identity" />,
    );
    expect(screen.getByRole("summary").props.accessibilityState).toEqual({
      busy: true,
    });

    await screen.rerender(
      <QuoteTokenState loading={false} text="Provider failed" />,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
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
