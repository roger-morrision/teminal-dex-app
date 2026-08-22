import { fireEvent, render } from "@testing-library/react-native";
import { State as MonitorState } from "../../app/(tabs)/monitor";
import { State as PortfolioState } from "../../app/(tabs)/portfolio";
import { PanelState } from "../../app/token/[address]";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

describe("primary and detail dynamic states", () => {
  it.each([
    ["Monitor", MonitorState],
    ["Portfolio", PortfolioState],
  ] as const)("announces %s state transitions", async (_name, State) => {
    const screen = await render(<State loading text="Loading evidence" />);
    expect(screen.getByRole("summary").props.accessibilityState).toEqual({
      busy: true,
    });

    await screen.rerender(<State error text="Provider failed" />);
    expect(screen.getByRole("alert")).toBeTruthy();

    await screen.rerender(<State text="No evidence" />);
    expect(
      screen.getByRole("summary").props.accessibilityState,
    ).toBeUndefined();
  });

  it("announces Token Detail failures and preserves retry", async () => {
    const retry = jest.fn();
    const screen = await render(
      <SettingsProvider>
        <PanelState
          error
          title="Unavailable"
          message="Provider failed"
          onRetry={retry}
        />
      </SettingsProvider>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Retry"));
    expect(retry).toHaveBeenCalledTimes(1);

    await screen.rerender(
      <SettingsProvider>
        <PanelState loading message="Loading token evidence" />
      </SettingsProvider>,
    );
    expect(screen.getByRole("summary").props.accessibilityState).toEqual({
      busy: true,
    });
  });
});
