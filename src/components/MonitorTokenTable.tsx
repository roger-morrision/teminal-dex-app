import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fetchDiscovery, getDiscoveryNextPageParam } from "@/api/client";
import type { MarketToken } from "@/api/schema";
import { compactUsd, signedPercent, tokenPrice } from "@/lib/format";
import { useSettings } from "@/settings/SettingsProvider";
import {
  defaultMonitorTablePreferences,
  filterAndSortMonitorTokens,
  loadMonitorTablePreferences,
  monitorTableActiveFilters,
  saveMonitorTablePreferences,
  toggleMonitorSort,
  type MonitorPreset,
  type MonitorSortKey,
  type MonitorTablePreferences,
  type MonitorWindow,
} from "@/store/monitor-table";
import { colors, spacing } from "@/theme";

const windows: MonitorWindow[] = ["1h", "6h", "24h"];
const presets: MonitorPreset[] = ["market", "liquidity", "flow"];
const sortKeys: MonitorSortKey[] = [
  "change1h",
  "volume1h",
  "liquidity",
  "marketCap",
];

type Column = "price" | "change1h" | "marketCap" | "liquidity" | "volume1h" | "flow";
const columns: Record<MonitorPreset, Column[]> = {
  market: ["price", "change1h", "marketCap"],
  liquidity: ["liquidity", "marketCap", "volume1h"],
  flow: ["change1h", "volume1h", "flow"],
};

export function MonitorTokenTable({ polling = true }: { polling?: boolean }) {
  const { t } = useSettings();
  const router = useRouter();
  const [preferences, setPreferences] = useState(defaultMonitorTablePreferences);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const saveSequence = useRef(0);

  useEffect(() => {
    void loadMonitorTablePreferences().then(setPreferences);
  }, []);

  const query = useInfiniteQuery({
    queryKey: ["monitor-token-table", preferences.window],
    queryFn: ({ pageParam, signal }) =>
      fetchDiscovery(
        "trending",
        preferences.window,
        { dex: "All", minLiquidity: "", minMarketCap: "" },
        pageParam,
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page, pages, _lastPageParam, pageParams) =>
      getDiscoveryNextPageParam("trending", page, pages, pageParams),
    maxPages: 4,
    refetchInterval: polling ? 30_000 : false,
  });
  const tokens = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages.flatMap((page) => page.tokens) ?? []).filter(
      (token) => !seen.has(token.address) && Boolean(seen.add(token.address)),
    );
  }, [query.data]);
  const rows = useMemo(
    () => filterAndSortMonitorTokens(tokens, preferences),
    [preferences, tokens],
  );
  const dexes = useMemo(
    () =>
      [...new Set(tokens.map((token) => token.dex.toLowerCase()))]
        .sort()
        .slice(0, 10),
    [tokens],
  );
  const firstPage = query.data?.pages[0];
  const activeFilters = monitorTableActiveFilters(preferences);

  const update = (change: Partial<MonitorTablePreferences>) => {
    const next = { ...preferences, ...change };
    const sequence = ++saveSequence.current;
    setPreferences(next);
    setStorageError(false);
    void saveMonitorTablePreferences(next).catch(() => {
      if (sequence === saveSequence.current) setStorageError(true);
    });
  };
  const resetFilters = () =>
    update({
      query: "",
      dex: "all",
      direction: "all",
      minLiquidity: "0",
      minMarketCap: "0",
      minVolume: "0",
    });

  return (
    <View style={styles.shell}>
      <View style={styles.headingRow}>
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={styles.heading}>
            {t("monitorTokenTable")}
          </Text>
          <Text style={styles.evidence}>
            {t("monitorTableEvidence", {
              source: firstPage?.source ?? t("sourceUnavailable"),
              quality: firstPage?.dataQuality ?? t("qualityUnavailable"),
              shown: rows.length,
              total: firstPage?.recordCount ?? firstPage?.totalCount ?? tokens.length,
              freshness: firstPage?.freshness?.isStale
                ? t("stale")
                : t("current"),
            })}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("refreshMonitorTable")}
          accessibilityState={{ busy: query.isRefetching }}
          disabled={query.isRefetching}
          onPress={() => void query.refetch()}
          style={styles.iconButton}
        >
          <Ionicons name="refresh" size={15} color={colors.text} />
        </Pressable>
      </View>
      <Text accessibilityRole="summary" style={styles.boundary}>
        {t("monitorOnlyBoundary")}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controls}>
        {windows.map((window) => (
          <Control
            key={window}
            label={window}
            active={preferences.window === window}
            onPress={() => update({ window })}
          />
        ))}
        <View style={styles.separator} />
        {presets.map((preset) => (
          <Control
            key={preset}
            label={t(`monitorPreset_${preset}`)}
            active={preferences.preset === preset}
            onPress={() => update({ preset })}
          />
        ))}
      </ScrollView>
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel={t("searchMonitorTokens")}
          value={preferences.query}
          onChangeText={(queryText) => update({ query: queryText.slice(0, 80) })}
          maxLength={80}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t("searchSymbolNameMint")}
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("monitorTableFilters")}
          accessibilityState={{ expanded: filtersOpen }}
          onPress={() => setFiltersOpen((value) => !value)}
          style={[styles.filterButton, filtersOpen && styles.controlActive]}
        >
          <Ionicons name="options" size={14} color={filtersOpen ? colors.accent : colors.muted} />
          <Text style={[styles.controlText, filtersOpen && styles.controlTextActive]}>
            {t("monitorFilters")}{activeFilters ? ` ${activeFilters}` : ""}
          </Text>
        </Pressable>
      </View>
      {filtersOpen ? (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>{t("monitorDirection")}</Text>
          <View style={styles.choiceRow}>
            {(["all", "positive", "negative"] as const).map((direction) => (
              <Control
                key={direction}
                label={t(`monitorDirection_${direction}`)}
                active={preferences.direction === direction}
                onPress={() => update({ direction })}
              />
            ))}
          </View>
          <Text style={styles.filterLabel}>{t("monitorDex")}</Text>
          <View style={styles.choiceRow}>
            <Control
              label={t("allDexes")}
              active={preferences.dex === "all"}
              onPress={() => update({ dex: "all" })}
            />
            {dexes.map((dex) => (
              <Control
                key={dex}
                label={dex}
                active={preferences.dex === dex}
                onPress={() => update({ dex })}
              />
            ))}
          </View>
          <Text style={styles.filterLabel}>{t("minimumEvidence")}</Text>
          <View style={styles.thresholdRow}>
            <Threshold
              label={t("liquidity")}
              value={preferences.minLiquidity}
              onChange={(minLiquidity) => update({ minLiquidity })}
            />
            <Threshold
              label={t("marketCap")}
              value={preferences.minMarketCap}
              onChange={(minMarketCap) => update({ minMarketCap })}
            />
            <Threshold
              label={t("oneHourVolume")}
              value={preferences.minVolume}
              onChange={(minVolume) => update({ minVolume })}
            />
          </View>
          <Text style={styles.filterLabel}>{t("multiSortMaxTwo")}</Text>
          <View style={styles.choiceRow}>
            {sortKeys.map((key) => {
              const position = preferences.sorts.findIndex((sort) => sort.key === key);
              const sort = preferences.sorts[position];
              return (
                <Control
                  key={key}
                  label={`${position >= 0 ? `${position + 1}·` : ""}${t(`monitorSort_${key}`)}${sort ? (sort.direction === "desc" ? " ↓" : " ↑") : ""}`}
                  active={position >= 0}
                  onPress={() => update({ sorts: toggleMonitorSort(preferences.sorts, key) })}
                />
              );
            })}
          </View>
          <View style={styles.panelFoot}>
            <Control
              label={t(preferences.density === "compact" ? "compactRows" : "comfortableRows")}
              active
              onPress={() =>
                update({ density: preferences.density === "compact" ? "comfortable" : "compact" })
              }
            />
            {activeFilters ? (
              <Pressable accessibilityRole="button" onPress={resetFilters}>
                <Text style={styles.reset}>{t("resetFilters")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
      {storageError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {t("monitorTableStorageUnavailable")}
        </Text>
      ) : null}
      {query.isLoading ? (
        <TableState text={t("loadingMonitorTokens")} busy />
      ) : query.isError && !query.data ? (
        <TableState text={t("evidenceLoadFailed")} error />
      ) : rows.length ? (
        <>
          <ScrollView horizontal accessibilityLabel={t("scrollMonitorTable")}>
            <View style={styles.table}>
              <TableHeader preset={preferences.preset} t={t} />
              {rows.map((token) => (
                <TableRow
                  key={token.address}
                  token={token}
                  preset={preferences.preset}
                  compact={preferences.density === "compact"}
                  onPress={() =>
                    router.push({
                      pathname: "/token/[address]",
                      params: { address: token.address, snapshot: JSON.stringify(token) },
                    })
                  }
                  t={t}
                />
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <TableState text={t("noMonitorTokensMatch")} />
      )}
      {query.isFetchNextPageError ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.paginationError}>
          <Text style={styles.error}>{t("monitorPaginationUnavailable")}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("retryMonitorPagination")}
            accessibilityState={{ busy: query.isFetchingNextPage, disabled: query.isFetchingNextPage }}
            disabled={query.isFetchingNextPage}
            onPress={() => void query.fetchNextPage()}
            style={[styles.loadMore, query.isFetchingNextPage && styles.disabled]}
          >
            <Text style={styles.loadMoreText}>{t("retry")}</Text>
          </Pressable>
        </View>
      ) : !query.isLoading && !query.isError && query.hasNextPage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("loadMoreMonitorTokens")}
          accessibilityState={{ busy: query.isFetchingNextPage }}
          disabled={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
          style={[styles.loadMore, query.isFetchingNextPage && styles.disabled]}
        >
          <Text style={styles.loadMoreText}>
            {query.isFetchingNextPage ? t("loadingMoreMarkets") : t("loadMoreMonitorTokens")}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Control({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.control, active && styles.controlActive]}
    >
      <Text style={[styles.controlText, active && styles.controlTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Threshold({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.threshold}>
      <Text style={styles.thresholdLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={(text) => {
          if (/^\d{0,12}(?:\.\d{0,2})?$/.test(text)) onChange(text);
        }}
        maxLength={15}
        keyboardType="decimal-pad"
        style={styles.thresholdInput}
      />
    </View>
  );
}

function TableHeader({ preset, t }: { preset: MonitorPreset; t: ReturnType<typeof useSettings>["t"] }) {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      <Text style={[styles.headerCell, styles.identity]}>{t("monitorToken")}</Text>
      {columns[preset].map((column) => (
        <Text key={column} style={styles.headerCell}>{t(`monitorColumn_${column}`)}</Text>
      ))}
      <Text style={[styles.headerCell, styles.status]}>{t("decisionState")}</Text>
    </View>
  );
}

function TableRow({ token, preset, compact, onPress, t }: { token: MarketToken; preset: MonitorPreset; compact: boolean; onPress: () => void; t: ReturnType<typeof useSettings>["t"] }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("openMonitorToken", { symbol: token.symbol })}
      onPress={onPress}
      style={[styles.tableRow, compact ? styles.rowCompact : styles.rowComfortable]}
    >
      <View style={styles.identity}>
        <Text numberOfLines={1} style={styles.symbol}>{token.symbol}</Text>
        <Text numberOfLines={1} style={styles.subtle}>{token.dex} · {token.source ?? t("sourceUnavailable")}</Text>
      </View>
      {columns[preset].map((column) => (
        <Text key={column} style={[styles.cell, column === "change1h" && (token.change1h >= 0 ? styles.positive : styles.negative)]}>
          {metric(token, column)}
        </Text>
      ))}
      <Text style={[styles.cell, styles.status]}>{t("monitoringOnly")}</Text>
    </Pressable>
  );
}

function metric(token: MarketToken, column: Column) {
  if (column === "price") return tokenPrice(token.price);
  if (column === "change1h") return signedPercent(token.change1h);
  if (column === "marketCap") return compactUsd(token.marketCap);
  if (column === "liquidity") return compactUsd(token.liquidity);
  if (column === "volume1h") return compactUsd(token.volume1h);
  return `${token.txns5m.buys}B/${token.txns5m.sells}S`;
}

function TableState({ text, busy, error }: { text: string; busy?: boolean; error?: boolean }) {
  return (
    <View accessibilityRole={error ? "alert" : "summary"} accessibilityState={busy ? { busy: true } : undefined} style={styles.state}>
      <Text style={error ? styles.error : styles.evidence}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { margin: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, overflow: "hidden" },
  flex: { flex: 1 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  heading: { color: colors.text, fontSize: 14, fontWeight: "900" },
  evidence: { color: colors.muted, fontSize: 9, marginTop: 3 },
  boundary: { color: colors.warning, fontSize: 9, lineHeight: 14, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  iconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 9 },
  controls: { gap: 6, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  separator: { width: 1, backgroundColor: colors.border, marginHorizontal: 2 },
  control: { minHeight: 34, justifyContent: "center", paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  controlActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  controlText: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  controlTextActive: { color: colors.accent },
  toolbar: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  search: { flex: 1, minHeight: 40, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 10, fontSize: 10 },
  filterButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 9 },
  filterPanel: { padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, gap: spacing.sm },
  filterLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  thresholdRow: { flexDirection: "row", gap: 6 },
  threshold: { flex: 1 },
  thresholdLabel: { color: colors.muted, fontSize: 8, marginBottom: 4 },
  thresholdInput: { minHeight: 38, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, fontSize: 9 },
  panelFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reset: { color: colors.negative, fontSize: 9, fontWeight: "800", padding: spacing.sm },
  error: { color: colors.negative, fontSize: 9, padding: spacing.md },
  table: { minWidth: 650 },
  tableRow: { flexDirection: "row", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingHorizontal: spacing.md },
  tableHeader: { minHeight: 34, backgroundColor: colors.background },
  rowCompact: { minHeight: 42 },
  rowComfortable: { minHeight: 58 },
  identity: { width: 135 },
  headerCell: { width: 105, color: colors.muted, fontSize: 8, fontWeight: "900", textTransform: "uppercase" },
  cell: { width: 105, color: colors.text, fontSize: 9 },
  status: { width: 160 },
  symbol: { color: colors.text, fontSize: 10, fontWeight: "900" },
  subtle: { color: colors.muted, fontSize: 8, marginTop: 2, textTransform: "capitalize" },
  positive: { color: colors.positive },
  negative: { color: colors.negative },
  state: { minHeight: 100, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  loadMore: { minHeight: 42, margin: spacing.md, marginTop: 0, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.accent, borderRadius: 9 },
  disabled: { opacity: 0.55 },
  loadMoreText: { color: colors.accent, fontSize: 10, fontWeight: "900" },
  paginationError: { marginHorizontal: spacing.lg, alignItems: "center" },
});
