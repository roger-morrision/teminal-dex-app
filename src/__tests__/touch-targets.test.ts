import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("primary market touch targets", () => {
  it("keeps Discover controls at a 44px minimum", () => {
    const text = source("app/(tabs)/discover.tsx");
    for (const style of ["pill", "periodButton", "filterButton", "retry", "dex", "reset", "apply"])
      expect(text).toMatch(new RegExp(`${style}: \\{[\\s\\S]*?minHeight: 44`));
  });

  it("keeps Monitor controls at a 44px minimum", () => {
    const text = source("src/components/MonitorTokenTable.tsx");
    expect(text).toMatch(/iconButton: \{ width: 44, height: 44/);
    expect(text).toMatch(/control: \{ minHeight: 44/);
    expect(text).toMatch(/resetButton: \{ minHeight: 44/);
    expect(text).toMatch(/loadMore: \{ minHeight: 44/);
    for (const role of ["radio", "checkbox", "switch"])
      expect(text).toContain(`role=\"${role}\"`);
  });

  it("keeps Trenches controls at a 44px minimum", () => {
    const text = source("app/(tabs)/trenches.tsx");
    for (const style of ["lane", "filterButton", "launchpad", "resetFilters"])
      expect(text).toMatch(new RegExp(`${style}: \\{[\\s\\S]*?minHeight: 44`));
  });

  it.each([
    ["AI", "app/ai.tsx", ["back"]],
    ["CopyTrade", "app/copytrade.tsx", ["back", "period", "modePill", "toggle", "pause"]],
    ["Research", "app/research-workspace.tsx", ["back", "remove", "smallInput", "iconButton"]],
    ["Wallet intelligence", "app/wallet-intelligence.tsx", ["back", "remove"]],
    ["Operations", "app/operations.tsx", ["back"]],
    ["Market intelligence", "app/market-intelligence.tsx", ["back"]],
    ["Trade", "app/trade/[address].tsx", ["back"]],
    ["Track", "app/track.tsx", ["filter", "retry"]],
    ["Settings", "app/settings.tsx", ["back"]],
    ["Token", "app/token/[address].tsx", ["back"]],
  ])("keeps %s interactive controls at a 44px minimum", (_name, path, styles) => {
    const text = source(path as string);
    for (const style of styles as string[])
      expect(text).toMatch(
        new RegExp(`${style}: \\{[\\s\\S]*?(?:minHeight: 44|width: 44,[\\s\\S]*?height: 44)`),
      );
  });
});
