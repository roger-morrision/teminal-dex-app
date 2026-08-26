import type { MarketToken } from "@/api/schema";

export type TrenchFilters = {
  keyword: string;
  launchpad: string;
  minMarketCap: string;
  minVolume24h: string;
  maxAgeMinutes: string;
  minBondingProgress: string;
};

export const emptyTrenchFilters: TrenchFilters = {
  keyword: "",
  launchpad: "All",
  minMarketCap: "",
  minVolume24h: "",
  maxAgeMinutes: "",
  minBondingProgress: "",
};

export function boundedKeyword(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 50);
}

export function boundedNumber(value: string, maximum?: number) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole = "", ...fractions] = cleaned.split(".");
  const bounded = `${whole.slice(0, 12)}${fractions.length ? `.${fractions.join("").slice(0, 2)}` : ""}`;
  if (maximum == null || bounded === "" || bounded === ".") return bounded;
  const parsed = Number(bounded);
  return Number.isFinite(parsed) && parsed > maximum ? String(maximum) : bounded;
}

function threshold(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function trenchFilterCount(filters: TrenchFilters) {
  return [
    filters.keyword.trim(),
    filters.launchpad !== "All",
    filters.minMarketCap,
    filters.minVolume24h,
    filters.maxAgeMinutes,
    filters.minBondingProgress,
  ].filter(Boolean).length;
}

export function applyTrenchFilters(
  tokens: MarketToken[],
  filters: TrenchFilters,
) {
  const keyword = filters.keyword.trim().toLocaleLowerCase();
  const minMarketCap = threshold(filters.minMarketCap);
  const minVolume24h = threshold(filters.minVolume24h);
  const maxAgeMinutes = threshold(filters.maxAgeMinutes);
  const minBondingProgress = threshold(filters.minBondingProgress);
  return tokens.filter((token) => {
    const progress = token.bondingProgress ?? token.progress ?? null;
    return (
      (!keyword ||
        `${token.symbol} ${token.name} ${token.address}`
          .toLocaleLowerCase()
          .includes(keyword)) &&
      (filters.launchpad === "All" ||
        token.dex.toLocaleLowerCase() ===
          filters.launchpad.toLocaleLowerCase()) &&
      (minMarketCap == null ||
        (token.marketCap != null && token.marketCap >= minMarketCap)) &&
      (minVolume24h == null || token.volume24h >= minVolume24h) &&
      (maxAgeMinutes == null || token.ageMinutes <= maxAgeMinutes) &&
      (minBondingProgress == null ||
        (progress != null && progress >= minBondingProgress))
    );
  });
}
