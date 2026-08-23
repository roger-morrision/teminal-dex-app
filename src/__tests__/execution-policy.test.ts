import { assertMobileRequestPolicy, mobileExecutionPolicy } from "@/security/execution-policy";

describe("mobile execution policy", () => {
  it("allows only the reviewed non-executing swap mutations", () => {
    for (const path of mobileExecutionPolicy.allowedSwapMutations) {
      expect(() => assertMobileRequestPolicy(path, "POST")).not.toThrow();
    }
    expect(mobileExecutionPolicy.executionEnabled).toBe(false);
    expect(mobileExecutionPolicy.liveSubmissionAuthority).toBe("absent");
  });

  it.each([
    "/api/swap/submit",
    "/api/swap/broadcast",
    "/api/swap/intents/consume",
    "/api/swap/intents/sign",
    "/api/copytrade/activate",
    "/api/copytrade/submit",
    "/api/copytrade/positions/position-1/close",
  ])("rejects forbidden execution route %s before network access", (path) => {
    expect(() => assertMobileRequestPolicy(path, "POST")).toThrow(/disabled/);
  });

  it("rejects unknown swap mutations and malformed relative paths", () => {
    expect(() => assertMobileRequestPolicy("/api/swap/intents/new-gate", "POST")).toThrow(/Unapproved/);
    expect(() => assertMobileRequestPolicy("https://host/api/swap/build", "POST")).toThrow(/invalid/);
    expect(() => assertMobileRequestPolicy("/api/../admin", "GET")).toThrow(/invalid/);
  });
});
