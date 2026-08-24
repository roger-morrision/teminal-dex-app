import type { WalletClassificationHistory } from "@/api/whale-contracts";

export function resolveCurrentWalletClassification(history: WalletClassificationHistory, now: number) {
  const current = history.versions.find((item) => item.effectiveAt <= now && (item.expiresAt == null || item.expiresAt > now));
  const active = current && current.label !== "revoked" && current.label !== "unclassified" ? current : null;
  return {
    schemaVersion: "wallet-classification-resolution-v1",
    wallet: history.wallet,
    label: active?.label ?? "unclassified",
    confidence: active?.confidence ?? null,
    version: active?.version ?? null,
    reason: !current ? "missing_or_expired" : current.label === "revoked" ? "revoked" : current.label === "unclassified" ? "unclassified" : null,
    executionEnabled: false as const,
  };
}
