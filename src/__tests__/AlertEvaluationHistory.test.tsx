import { render } from "@testing-library/react-native";
import { EvaluationHistory } from "../../app/(tabs)/monitor";
import { alertEvaluationHistorySchema } from "@/api/schema";
import { SettingsProvider } from "@/settings/SettingsProvider";

jest.mock("@/security/WalletSessionProvider", () => ({ useWalletSession: jest.fn() }));

const address = "11111111111111111111111111111111";
const evaluation = { id: "evaluation_1", alertId: "alert_123", alert: { address, type: "price" as const, name: "Price floor" }, evaluationVersion: "user-alert-threshold-v1", source: "birdeye", sourceIdentity: "pair_123456", observedAt: 1_800_000_000_000, evaluatedAt: 1_800_000_000_100, metric: { name: "priceUsd", value: 1.25, operator: "gte" as const, threshold: 1 }, status: "triggered" as const, triggered: true, reason: null, deliveries: [] };

describe("alert evaluation history", () => {
  it("renders owner evaluation provenance separately from delivery authority", async () => {
    const screen = await render(<SettingsProvider><EvaluationHistory data={[evaluation]} loading={false} /></SettingsProvider>);
    expect(screen.getByText("Evaluation history")).toBeTruthy();
    expect(screen.getByText(/Price floor · Triggered/)).toBeTruthy();
    expect(screen.getByText(/does not prove delivery or authorize a trade/)).toBeTruthy();
    expect(screen.queryByText(/Buy|Trade|Submit/)).toBeNull();
  });

  it("rejects oversized delivery evidence and forged pagination", () => {
    const payload = { schema: "alert-evaluation-history-v1", data: [{ ...evaluation, deliveries: Array.from({ length: 6 }, () => ({ channel: "inApp", status: "delivered", reason: null })) }], page: { limit: 101, hasMore: false, nextCursor: null }, persistence: "database", fetchedAt: 1_800_000_000_200 };
    expect(alertEvaluationHistorySchema.safeParse(payload).success).toBe(false);
  });
});
