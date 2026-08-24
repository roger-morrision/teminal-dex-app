import type { WalletClassificationHistory } from "@/api/whale-contracts";
import { resolveCurrentWalletClassification } from "@/lib/wallet-classification";

const wallet = "11111111111111111111111111111111";
const history = (label: "whale" | "smart_money" | "unclassified" | "revoked", expiresAt: number | null): WalletClassificationHistory => ({ schema: "wallet-classification-history-v1", wallet, generatedAt: 10, versions: [{ id: "class_0001", version: 1, label, confidence: 0.9, effectiveAt: 1, expiresAt, evidenceHash: "a".repeat(64) }], executionEnabled: false });

describe("current wallet classification", () => {
  it("resolves only active classifications", () => {
    expect(resolveCurrentWalletClassification(history("whale", 20), 10)).toMatchObject({ label: "whale", confidence: 0.9, version: 1, reason: null, executionEnabled: false });
    expect(resolveCurrentWalletClassification(history("whale", 5), 10)).toMatchObject({ label: "unclassified", reason: "missing_or_expired" });
  });

  it("fails closed for revocation and explicit unclassification", () => {
    expect(resolveCurrentWalletClassification(history("revoked", null), 10)).toMatchObject({ label: "unclassified", reason: "revoked" });
    expect(resolveCurrentWalletClassification(history("unclassified", null), 10)).toMatchObject({ label: "unclassified", reason: "unclassified" });
  });
});
