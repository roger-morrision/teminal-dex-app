import { render } from "@testing-library/react-native";
import { Paper } from "../../app/ai";
import { SettingsProvider } from "@/settings/SettingsProvider";
import type { AiPaperReport } from "@/api/schema";

jest.mock("@/security/WalletSessionProvider", () => ({
  useWalletSession: jest.fn(),
}));

const report: AiPaperReport = {
  mode: "simulation",
  executionEnabled: false,
  readOnly: true,
  generatedAt: 1,
  config: { enabled: true, startingCashUsd: 1000, positionSizeUsd: 10, maxOpenPositions: 2, minScore: 70, minConfidence: 70, takeProfitPct: 20, stopLossPct: 10, feeBps: 10, slippageBps: 20 },
  summary: { equityUsd: 1000, totalPnlUsd: 0, realizedPnlUsd: 0, unrealizedPnlUsd: 0, openPositions: 0, closedTrades: 0, winRate: null, maxDrawdownPct: 0, markCoverage: 1, unavailableMarks: 0 },
  analytics: { profitFactor: null, expectancyUsd: null, totalFeesUsd: 0, totalSlippageCostUsd: 0 },
  risk: { entriesAllowed: false, dailyLossLimitHit: false, cooldownActive: false },
  readiness: { status: "collecting", executionEnabled: false, killSwitch: true, note: "advisory only", checks: {} },
  operations: { schemaVersion: "paper-operational-health-v1", status: "degraded", cycleStatus: "abandoned", failedOrAbandoned24h: 1, openPositions: 0, qualifiedOpenPositions: 0, markCoverageApplicable: false, freshMarks: 0, freshMarkCoverage: null, leaseValid: false, reasons: ["recent_cycle_failures"], simulationOnly: true, executionEnabled: false },
  mutationHealth: { schemaVersion: "paper-mutation-health-v2", auditedMutations: 3, qualifiedMutations: 2, excludedMutations: 1, duplicateKeys: 0, staleProcessing: 0, manualReview: 1, recoveryPolicy: "fail_closed_no_automatic_replay", healthy: false, reasons: ["mutation_lifecycle_invalid"], simulationOnly: true, executionEnabled: false },
  jobLeaseHealth: { schemaVersion: "paper-job-lease-health-v1", status: "healthy_idle", observedLeases: 0, qualifiedLeases: 0, excludedLeases: 0, activeLeases: 0, expiredLeases: 0, contentionFree: true, reasonCounts: {}, simulationOnly: true, executionEnabled: false },
  cycleHistoryHealth: { schemaVersion: "paper-cycle-history-health-v2", status: "collecting_or_invalid", observedCycles: 3, qualifiedCycles: 2, excludedCycles: 1, qualifiedTerminalCycles: 2, runningCycles: 0, contentionFree: true, fencingEvidenceRequired: true, minimumHistory: 20, historyReady: false, reasonCounts: { invalid_cycle_chronology: 1 }, simulationOnly: true, executionEnabled: false },
  positions: [],
  closedTrades: [],
  dailyPerformance: [],
  potentialPool: [],
};

describe("Paper operational integrity", () => {
  it("renders degraded evidence and the fail-closed recovery boundary", async () => {
    const screen = await render(
      <SettingsProvider>
        <Paper report={report} loading={false} />
      </SettingsProvider>,
    );

    expect(screen.getByText("Operational integrity")).toBeTruthy();
    expect(screen.getByText("degraded")).toBeTruthy();
    expect(screen.getByText(/Qualified 2\/3 · manual review 1/)).toBeTruthy();
    expect(screen.getByText(/never replays an unknown partial operation/)).toBeTruthy();
    expect(screen.queryByText(/execute|approve transaction/i)).toBeNull();
  });
});
