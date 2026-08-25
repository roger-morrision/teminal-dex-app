import { fireEvent, render } from "@testing-library/react-native";
import { IndexerHealthCard } from "../../app/operations";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn(), removeItem: jest.fn() },
}));

const healthy = {
  schemaVersion: 1 as const,
  source: "solana-indexer" as const,
  available: true as const,
  upstreamStatus: 200 as const,
  status: "healthy",
  healthy: true,
  reason: null,
  tip: 123,
  ageMs: 100,
  staleAfterMs: 5_000,
  updatedAt: new Date().toISOString(),
  ingestion: { source: "rpc", commitment: "confirmed", sourceTip: 123, exportLagSlots: 2 },
  quality: { events: { canonical: true, reason: null }, recovery: { canonical: false, reason: "collecting" } },
  automationSafe: false as const,
};

describe("IndexerHealthCard", () => {
  it("renders bounded healthy evidence and a non-execution boundary", async () => {
    const screen = await render(<SettingsProvider><IndexerHealthCard evidence={healthy} error={false} retrying={false} onRetry={jest.fn()} /></SettingsProvider>);
    expect(screen.getByLabelText("Solana indexer health: Healthy")).toBeTruthy();
    expect(screen.getByText(/Tip 123 · updated (?:now|\d+s ago) · export lag 2 slots/)).toBeTruthy();
    expect(screen.getByText("events: canonical")).toBeTruthy();
    expect(screen.getByText("recovery: not canonical")).toBeTruthy();
    expect(screen.getByText(/cannot enable automation or transactions/)).toBeTruthy();
  });

  it("distinguishes unavailable reasons without inventing counts", async () => {
    const screen = await render(<SettingsProvider><IndexerHealthCard evidence={{ schemaVersion: 1, source: "solana-indexer", available: false, healthy: false, reason: "not_configured", automationSafe: false }} error={false} retrying={false} onRetry={jest.fn()} /></SettingsProvider>);
    expect(screen.getByLabelText("Solana indexer health: Indexer health is not configured.")).toBeTruthy();
    expect(screen.queryByText(/Tip 0/)).toBeNull();
  });

  it("exposes busy-safe private recovery", async () => {
    const retry = jest.fn();
    const screen = await render(<SettingsProvider><IndexerHealthCard error retrying onRetry={retry} /></SettingsProvider>);
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    fireEvent.press(button);
    expect(retry).not.toHaveBeenCalled();
  });
});
