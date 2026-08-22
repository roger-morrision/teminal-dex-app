import type { AlertDeliveriesResponse, UserAlert } from "@/api/schema";

export function watchlistAlertStatus(
  address: string,
  alerts: UserAlert[],
  deliveries: AlertDeliveriesResponse["data"],
) {
  const matching = alerts.filter((alert) => alert.address === address);
  const ids = new Set(matching.map((alert) => alert.id));
  const latest = deliveries
    .filter((delivery) => ids.has(delivery.alertId))
    .sort(
      (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    )[0];
  return {
    total: matching.length,
    active: matching.filter((alert) => alert.active).length,
    triggered: matching.reduce((sum, alert) => sum + alert.triggerCount, 0),
    latestDelivery: latest?.status ?? null,
    latestReason: latest?.reason ?? null,
  };
}
