export type TransactionEvidenceManifest = {
  schemaVersion: "transaction-evidence-manifest-v1";
  intentId: string;
  ownerWallet: string;
  transactionHash: string;
  messageHash: string;
  quoteHash: string;
  policyHash: string;
  confirmationHash: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  quotedOutAmount: string;
  expiresAt: number;
  assembledAt: number;
  executionEnabled: false;
};

const hashPattern = /^[a-f0-9]{64}$/;
const solanaKeyPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function validateTransactionManifest(manifest: TransactionEvidenceManifest, expected: {
  intentId: string;
  ownerWallet: string;
  transactionHash: string;
  messageHash: string;
  quoteHash: string;
  policyHash: string;
  confirmationHash: string;
  now: number;
}) {
  const reasons = [
    ...(!manifest.intentId || manifest.intentId !== expected.intentId ? ["intent_mismatch"] : []),
    ...(manifest.ownerWallet !== expected.ownerWallet || !solanaKeyPattern.test(manifest.ownerWallet) ? ["owner_mismatch"] : []),
    ...(["transactionHash", "messageHash", "quoteHash", "policyHash", "confirmationHash"] as const)
      .filter((field) => !hashPattern.test(manifest[field]) || manifest[field] !== expected[field])
      .map((field) => `${field}_mismatch`),
    ...(!solanaKeyPattern.test(manifest.inputMint) || !solanaKeyPattern.test(manifest.outputMint) ? ["invalid_mint_identity"] : []),
    ...(!/^\d+$/.test(manifest.inAmount) || !/^\d+$/.test(manifest.quotedOutAmount) ? ["invalid_amount_identity"] : []),
    ...(!Number.isSafeInteger(manifest.assembledAt) || manifest.assembledAt <= 0 || manifest.assembledAt > expected.now ? ["invalid_assembly_time"] : []),
    ...(!Number.isSafeInteger(manifest.expiresAt) || manifest.expiresAt <= expected.now ? ["manifest_expired"] : []),
  ];
  return { schemaVersion: "transaction-manifest-validation-v1", valid: reasons.length === 0, reasons, executionEnabled: false as const };
}
