const SAFE_SWAP_MUTATIONS = new Set([
  "/api/swap/build",
  "/api/swap/intents/inspect",
  "/api/swap/intents/simulate",
  "/api/swap/intents/confirm",
]);

const FORBIDDEN_EXECUTION_ROUTES = [
  /^\/api\/swap\/(?:submit|send|broadcast|execute)(?:\/|$)/i,
  /^\/api\/swap\/intents\/(?:consume|sign|submit|execute)(?:\/|$)/i,
  /^\/api\/copytrade\/(?:activate|copy|confirm|submit|execute)(?:\/|$)/i,
  /^\/api\/copytrade\/positions\/[^/]+\/(?:close|sell)(?:\/|$)/i,
];

export function assertMobileRequestPolicy(path: string, method = "GET") {
  const normalizedMethod = method.toUpperCase();
  if (!path.startsWith("/api/") || path.includes("\\") || path.includes("..")) {
    throw new Error("Mobile API path is invalid.");
  }
  if (FORBIDDEN_EXECUTION_ROUTES.some((pattern) => pattern.test(path))) {
    throw new Error("Live execution routes are disabled in the mobile client.");
  }
  if (normalizedMethod !== "GET" && path.startsWith("/api/swap/") && !SAFE_SWAP_MUTATIONS.has(path)) {
    throw new Error("Unapproved swap mutation is disabled in the mobile client.");
  }
}

export const mobileExecutionPolicy = Object.freeze({
  schemaVersion: "mobile-execution-policy-v1",
  executionEnabled: false as const,
  allowedSwapMutations: [...SAFE_SWAP_MUTATIONS],
  liveSubmissionAuthority: "absent" as const,
  copyTradeActivationAuthority: "absent" as const,
});
