import { publicErrorMessage } from "@/lib/public-error";

describe("public error policy", () => {
  it("never exposes exception, provider, origin, or native details", () => {
    const hostile = new Error("POST http://127.0.0.1:3000 failed: java.net.ConnectException secret=abc");
    expect(publicErrorMessage(hostile, "Action could not be completed.")).toBe(
      "Action could not be completed.",
    );
  });

  it("fails closed for non-Error payloads", () => {
    expect(publicErrorMessage({ token: "secret" }, "Evidence unavailable.")).toBe(
      "Evidence unavailable.",
    );
  });
});
