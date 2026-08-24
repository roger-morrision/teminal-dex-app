import { fireEvent, render } from "@testing-library/react-native";
import { State as DiscoverState } from "../../app/(tabs)/discover";
import { State as TrenchesState } from "../../app/(tabs)/trenches";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

describe("primary market dynamic states", () => {
  it("announces Discover loading as a polite busy summary", async () => {
    const screen = await render(
      <DiscoverState loading message="Loading markets" />,
    );
    const state = screen.getByRole("summary");
    expect(state.props.accessibilityLiveRegion).toBe("polite");
    expect(state.props.accessibilityState).toEqual({ busy: true });
  });

  it("announces Discover errors and keeps retry actionable", async () => {
    const retry = jest.fn();
    const screen = await render(
      <DiscoverState
        error
        title="Unavailable"
        message="Provider failed"
        action="Retry"
        onAction={retry}
      />,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Retry"));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps provider-empty recovery actionable without presenting an error", async () => {
    const retry = jest.fn();
    const screen = await render(<DiscoverState title="No validated provider rows" message="Provider returned no rows" action="Retry" onAction={retry} />);
    expect(screen.getByRole("summary")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    await fireEvent.press(screen.getByLabelText("Retry"));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("distinguishes Trenches busy, error, and empty evidence", async () => {
    const screen = await render(
      <TrenchesState loading text="Loading launches" />,
    );
    expect(screen.getByRole("summary").props.accessibilityState).toEqual({
      busy: true,
    });
    await screen.rerender(<TrenchesState error text="Provider failed" />);
    expect(screen.getByRole("alert")).toBeTruthy();
    await screen.rerender(<TrenchesState text="No launches" />);
    expect(
      screen.getByRole("summary").props.accessibilityState,
    ).toBeUndefined();
  });
});
