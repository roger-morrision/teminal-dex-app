import { validateTransactionManifest, type TransactionEvidenceManifest } from "@/security/transaction-manifest";

const owner = "11111111111111111111111111111111";
const hash = "a".repeat(64);
const manifest: TransactionEvidenceManifest = {
  schemaVersion: "transaction-evidence-manifest-v1", intentId: "intent_123", ownerWallet: owner,
  transactionHash: hash, messageHash: hash, quoteHash: hash, policyHash: hash, confirmationHash: hash,
  inputMint: owner, outputMint: "So11111111111111111111111111111111111111112", inAmount: "1", quotedOutAmount: "2",
  expiresAt: 2_000, assembledAt: 1_000, executionEnabled: false,
};
const expected = { intentId: "intent_123", ownerWallet: owner, transactionHash: hash, messageHash: hash, quoteHash: hash, policyHash: hash, confirmationHash: hash, now: 1_500 };

describe("transaction evidence manifest", () => {
  it("accepts an exact, unexpired evidence chain without granting execution", () => {
    expect(validateTransactionManifest(manifest, expected)).toEqual({ schemaVersion: "transaction-manifest-validation-v1", valid: true, reasons: [], executionEnabled: false });
  });

  it("rejects cross-contract substitution and expiry", () => {
    const result = validateTransactionManifest({ ...manifest, policyHash: "b".repeat(64), expiresAt: 1_500 }, expected);
    expect(result.valid).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining(["policyHash_mismatch", "manifest_expired"]));
  });
});
