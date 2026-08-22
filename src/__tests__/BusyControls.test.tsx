import { fireEvent, render } from "@testing-library/react-native";
import { RefreshChartButton } from "../../app/research-workspace";
import { BusyIndicator } from "@/components/BusyIndicator";

describe("inline asynchronous controls", () => {
  it("announces inline evidence loading as a polite busy summary", async () => {
    const screen = await render(
      <BusyIndicator label="Loading more evidence" />,
    );
    const state = screen.getByRole("summary");
    expect(state.props.accessibilityLabel).toBe("Loading more evidence");
    expect(state.props.accessibilityLiveRegion).toBe("polite");
    expect(state.props.accessibilityState).toEqual({ busy: true });
  });

  it("prevents duplicate chart refreshes while a refetch is active", async () => {
    const refresh = jest.fn();
    const screen = await render(
      <RefreshChartButton refreshing label="Refresh chart" onPress={refresh} />,
    );
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    await fireEvent.press(button);
    expect(refresh).not.toHaveBeenCalled();

    await screen.rerender(
      <RefreshChartButton
        refreshing={false}
        label="Refresh chart"
        onPress={refresh}
      />,
    );
    await fireEvent.press(screen.getByRole("button"));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
