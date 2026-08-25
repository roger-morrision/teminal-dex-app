import { fireEvent, render } from "@testing-library/react-native";
import { WhaleFeedUnavailable } from "../../app/(tabs)/whales";
import { SettingsProvider } from "@/settings/SettingsProvider";

it("distinguishes unconfigured whale ownership from a quiet evidence window", async () => {
  const onWallets = jest.fn();
  const screen = await render(
    <SettingsProvider>
      <WhaleFeedUnavailable reason="eligible_token_allowlist_unconfigured" onWallets={onWallets} />
    </SettingsProvider>,
  );
  expect(screen.getByText("Whale token list is not configured")).toBeTruthy();
  expect(screen.getByText(/No wallet is labeled from transaction size alone/)).toBeTruthy();
  await fireEvent.press(screen.getByLabelText("View ranked whale wallets"));
  expect(onWallets).toHaveBeenCalledTimes(1);

  await screen.rerender(
    <SettingsProvider>
      <WhaleFeedUnavailable reason="no_recent_qualified_records" onWallets={onWallets} />
    </SettingsProvider>,
  );
  expect(screen.getByText("No current whale activity records")).toBeTruthy();
});
