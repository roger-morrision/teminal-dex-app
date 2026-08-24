import { fireEvent, render } from "@testing-library/react-native";
import { State as MonitorState } from "../../app/(tabs)/monitor";
import { State as PortfolioState } from "../../app/(tabs)/portfolio";
import { State as DiscoverState } from "../../app/(tabs)/discover";
import { Limitation, PanelState } from "../../app/token/[address]";
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

  it("guards Token Detail recovery while refetching", async () => {
    const retry = jest.fn();
    const screen = await render(
      <SettingsProvider>
        <PanelState
          error
          title="Unavailable"
          message="Provider failed"
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

  it("guards Token Detail inline recovery and omits inert actions", async () => {
    const retry = jest.fn();
    const screen = await render(
      <Limitation text="Refresh failed" action="Retry" actionBusy onAction={retry} />,
    );
    const button = screen.getByLabelText("Retry");
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    await fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();

    await screen.rerender(<Limitation text="No action" action="Retry" />);
    expect(screen.queryByLabelText("Retry")).toBeNull();
  });

  it("guards Discover recovery while a retry is in progress", async () => {
    const retry = jest.fn();
    const screen = await render(
      <DiscoverState error message="Provider failed" action="Retry" actionBusy onAction={retry} />,
    );
    const button = screen.getByLabelText("Retry");
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    await fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();

    await screen.rerender(<DiscoverState message="No evidence" action="Retry" />);
    expect(screen.queryByLabelText("Retry")).toBeNull();
  });

  it("guards Portfolio recovery and omits inert actions", async () => {
    const retry = jest.fn();
    const screen = await render(
      <PortfolioState error text="Provider failed" action="Retry" actionBusy onAction={retry} />,
    );
    const button = screen.getByLabelText("Retry");
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    await fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();

    await screen.rerender(<PortfolioState text="No holdings" action="Retry" />);
    expect(screen.queryByLabelText("Retry")).toBeNull();
  });

  it("guards Monitor recovery and omits inert actions", async () => {
    const retry = jest.fn();
    const screen = await render(
      <MonitorState error text="Provider failed" action="Retry" actionBusy onAction={retry} />,
    );
    const button = screen.getByLabelText("Retry");
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    await fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();

    await screen.rerender(<MonitorState text="No alerts" action="Retry" />);
    expect(screen.queryByLabelText("Retry")).toBeNull();
  });
});
