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
});
