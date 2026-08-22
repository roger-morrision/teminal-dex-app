import { watchlistAlertStatus } from "@/lib/watchlist-status";
import type { AlertDeliveriesResponse, UserAlert } from "@/api/schema";

const address = "11111111111111111111111111111111";
const alert = (
  id: string,
  active: boolean,
  triggerCount: number,
): UserAlert => ({
  id,
  userId: address,
  chainId: "solana",
  address,
  type: "price",
  name: id,
  description: "",
  conditions: {},
  channels: ["inApp"],
  cooldownMinutes: 1,
  active,
  lastTriggered: null,
  triggerCount,
  createdAt: 1,
  updatedAt: 1,
  persistence: "database",
});
const delivery = (
  alertId: string,
  status: "queued" | "failed",
  updatedAt: string,
) =>
  ({
    id: `${alertId}-${status}`,
    alertId,
    eventKey: "event",
    channel: "inApp",
    status,
    reason: status === "failed" ? "failed reason" : null,
    deliveredAt: null,
    createdAt: updatedAt,
    updatedAt,
  }) as AlertDeliveriesResponse["data"][number];

it("joins exact-token alerts and selects the latest durable delivery", () => {
  const result = watchlistAlertStatus(
    address,
    [alert("a", true, 2), alert("b", false, 1)],
    [
      delivery("a", "queued", "2026-08-22T00:00:00.000Z"),
      delivery("b", "failed", "2026-08-22T00:01:00.000Z"),
    ],
  );
  expect(result).toEqual({
    total: 2,
    active: 1,
    triggered: 3,
    latestDelivery: "failed",
    latestReason: "failed reason",
  });
});
