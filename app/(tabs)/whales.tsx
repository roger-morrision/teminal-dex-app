import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchTopTraders, fetchTrackFeed } from "@/api/client";
import type { TopTrader, TrackNotification } from "@/api/schema";
import { compactUsd, signedPercent, tokenPrice } from "@/lib/format";
import { aggregateWhaleActivity, filterWhaleEvents, filterWhaleFlows, filterWhaleWalletRankings, isWhaleActivity, whaleAmountContext, whaleHoldingIdentity, type WhaleEventDirection, type WhaleEventSort, type WhaleFlow } from "@/lib/whale-activity";
import { useSettings } from "@/settings/SettingsProvider";
import { defaultWhaleWatchPreferences, loadWhaleWatchPreferences, saveWhaleWatchPreferences, type WhaleWatchMode } from "@/store/whale-watch";
import { colors, spacing } from "@/theme";
import { TokenAvatar } from "@/components/TokenAvatar";
import { DexLogo } from "@/components/DexLogo";

type Mode = WhaleWatchMode;
const modes: Mode[] = ["live", "accumulating", "distributing", "wallets", "alerts"];

export default function WhalesScreen() {
  const { t } = useSettings();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const narrow = width < 380;
  const largeText = fontScale >= 1.5;
  const [mode, setMode] = useState<Mode>(defaultWhaleWatchPreferences.mode);
  const [direction, setDirection] = useState<WhaleEventDirection>(defaultWhaleWatchPreferences.direction);
  const [minimumUsd, setMinimumUsd] = useState(defaultWhaleWatchPreferences.minimumUsd);
  const [sort, setSort] = useState<WhaleEventSort>(defaultWhaleWatchPreferences.sort);
  const [query, setQuery] = useState("");
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [preferencesError, setPreferencesError] = useState(false);
  useEffect(() => {
    let current = true;
    void loadWhaleWatchPreferences().then((value) => {
      if (!current) return;
      setMode(value.mode);
      setDirection(value.direction);
      setMinimumUsd(value.minimumUsd);
      setSort(value.sort);
      setPreferencesReady(true);
    });
    return () => { current = false; };
  }, []);
  useEffect(() => {
    if (!preferencesReady) return;
    void saveWhaleWatchPreferences({ mode, direction, minimumUsd, sort })
      .then(() => setPreferencesError(false))
      .catch(() => setPreferencesError(true));
  }, [direction, minimumUsd, mode, preferencesReady, sort]);
  const activityMode = mode === "live" || mode === "accumulating" || mode === "distributing";
  const feed = useQuery({ queryKey: ["whale-activity"], queryFn: ({ signal }) => fetchTrackFeed(signal), enabled: activityMode, refetchInterval: activityMode ? 30_000 : false });
  const rankings = useQuery({ queryKey: ["whale-wallet-rankings"], queryFn: ({ signal }) => fetchTopTraders("30D", signal), enabled: mode === "wallets" });
  const allEvents = useMemo(() => (feed.data?.notifications ?? []).filter(isWhaleActivity).sort((a, b) => b.observedAt - a.observedAt), [feed.data]);
  const events = useMemo(() => filterWhaleEvents(allEvents, { direction, minimumUsd, sort, query }), [allEvents, direction, minimumUsd, query, sort]);
  const flows = useMemo(() => aggregateWhaleActivity(allEvents), [allEvents]);
  const searchedFlows = useMemo(() => filterWhaleFlows(flows, query), [flows, query]);
  const wallets = useMemo(() => (rankings.data?.traders ?? []).filter((item) => item.badge === "Whale" || item.badge === "Smart Money"), [rankings.data]);
  const searchedWallets = useMemo(() => filterWhaleWalletRankings(wallets, query), [query, wallets]);
  const historical = feed.data?.evidenceWindow?.smartMoneyHistorical || feed.data?.evidenceWindow?.whaleTransactionsHistorical;
  const evidenceCount = historical ? allEvents.length : (feed.data?.coverage?.whaleTransactions.currentRecordCount ?? feed.data?.coverage?.whaleTransactions.recordCount ?? 0);
  const refresh = () => mode === "wallets" ? rankings.refetch() : feed.refetch();
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <ScrollView refreshControl={mode === "alerts" ? undefined : <RefreshControl refreshing={feed.isRefetching || rankings.isRefetching} onRefresh={refresh} tintColor={colors.accent} />} contentContainerStyle={[styles.content, narrow && { paddingHorizontal: spacing.md }]}>
      {mode === "alerts" ? null : <View style={styles.searchRow}><View style={styles.searchBox}><Ionicons name="search" size={16} color={colors.muted} /><TextInput accessibilityLabel={t("searchWhaleActivity")} placeholder={t("searchWhaleActivity")} placeholderTextColor={colors.muted} value={query} onChangeText={(value) => setQuery(value.slice(0, 80))} maxLength={80} autoCapitalize="none" autoCorrect={false} style={styles.searchInput} />{query ? <Pressable accessibilityRole="button" accessibilityLabel={t("resetWhaleFilters")} onPress={() => setQuery("")}><Ionicons name="close-circle" size={17} color={colors.muted} /></Pressable> : null}</View><View accessible accessibilityLabel={t("whaleChainScope")} style={styles.chain}><Text style={styles.chainMark}>≋</Text><Text style={styles.chainText}>SOL</Text></View></View>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" style={styles.tabRail} contentContainerStyle={[styles.tabs, { marginVertical: 0 }]}>{modes.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: mode === item }} accessibilityLabel={t("selectWhaleView", { view: t(`whaleMode_${item}`) })} onPress={() => setMode(item)} style={[styles.tab, { minWidth: 88, flex: 0 }, mode === item && styles.tabActive]}><Text style={[styles.tabText, mode === item && styles.tabTextActive]}>{t(`whaleMode_${item}`)}</Text></Pressable>)}</ScrollView>
      {activityMode ? <View accessible accessibilityRole="summary" accessibilityLabel={`${evidenceCount} ${t(historical ? "historicalEvidence" : "whaleMode_live")}. ${t("whaleEvidenceBoundary")} ${t("whaleMarketChangeBoundary")}`} style={styles.compactStatus}><View style={[styles.dot, historical && styles.stale]} /><Text numberOfLines={1} style={styles.statusText}>{evidenceCount} {t(historical ? "historicalEvidence" : "whaleMode_live").toUpperCase()}</Text><Ionicons name="information-circle-outline" size={14} color={colors.muted} /></View> : null}
      {preferencesError ? <Text accessibilityRole="alert" style={styles.preferenceError}>{t("whalePreferencesSaveFailed")}</Text> : null}
      {mode === "live" ? <WhaleControls direction={direction} minimumUsd={minimumUsd} sort={sort} onDirection={setDirection} onMinimum={setMinimumUsd} onSort={setSort} onReset={() => { setDirection("all"); setMinimumUsd(0); setSort("latest"); setQuery(""); }} /> : null}
      {mode === "wallets" ? <WalletRankings rows={searchedWallets} hasEvidence={wallets.length > 0} loading={rankings.isLoading} refreshing={rankings.isFetching} error={rankings.isError} onRetry={() => rankings.refetch()} onOpenAll={() => router.push("/wallet-intelligence")} onOpen={(walletAddress) => router.push({ pathname: "/wallet-intelligence", params: { address: walletAddress } })} /> : mode === "alerts" ? <AlertsHandoff onOpen={() => router.push("/(tabs)/monitor")} /> : feed.isLoading ? <State text={t("loadingWhaleActivity")} /> : feed.isError ? <State error text={t("whaleLoadFailed")} retrying={feed.isFetching} onRetry={() => feed.refetch()} /> : !allEvents.length ? <WhaleFeedUnavailable reason={feed.data?.coverage?.whaleTransactions.dataQuality} onWallets={() => setMode("wallets")} /> : mode === "live" ? <LiveEvents rows={events} largeText={largeText} onReset={() => { setDirection("all"); setMinimumUsd(0); setSort("latest"); setQuery(""); }} onOpen={(address) => router.push({ pathname: "/token/[address]", params: { address } })} /> : <FlowList rows={searchedFlows.filter((item) => mode === "accumulating" ? item.netUsd > 0 : item.netUsd < 0)} onOpen={(address) => router.push({ pathname: "/token/[address]", params: { address } })} />}
    </ScrollView>
  </SafeAreaView>;
}

function WhaleControls({ direction, minimumUsd, sort, onDirection, onMinimum, onSort, onReset }: { direction: WhaleEventDirection; minimumUsd: 0 | 25_000 | 100_000; sort: WhaleEventSort; onDirection: (value: WhaleEventDirection) => void; onMinimum: (value: 0 | 25_000 | 100_000) => void; onSort: (value: WhaleEventSort) => void; onReset: () => void }) {
  const { t } = useSettings();
  const filtered = direction !== "all" || minimumUsd !== 0 || sort !== "latest";
  return <View accessibilityRole="summary" style={styles.controls}>{filtered ? <Pressable accessibilityRole="button" accessibilityLabel={t("resetWhaleFilters")} onPress={onReset} style={styles.reset}><Ionicons name="refresh" size={13} color={colors.accent} /><Text style={styles.resetText}>{t("resetWhaleFilters")}</Text></Pressable> : null}<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlRow}>{(["all", "buy", "sell"] as const).map((item) => <Control key={item} label={t(`whaleDirection_${item}`)} accessibilityLabel={t("selectWhaleDirection", { direction: t(`whaleDirection_${item}`) })} active={direction === item} onPress={() => onDirection(item)} />)}<View style={styles.controlDivider} />{([0, 25_000, 100_000] as const).map((amount) => <Control key={amount} label={amount ? `≥ ${compactUsd(amount)}` : t("whaleAnyAmount")} accessibilityLabel={t("selectWhaleMinimum", { amount: amount ? compactUsd(amount) : t("whaleAnyAmount") })} active={minimumUsd === amount} onPress={() => onMinimum(amount)} />)}<View style={styles.controlDivider} />{(["latest", "largest"] as const).map((item) => <Control key={item} label={t(`whaleSort_${item}`)} accessibilityLabel={t("selectWhaleSort", { sort: t(`whaleSort_${item}`) })} active={sort === item} onPress={() => onSort(item)} />)}</ScrollView></View>;
}

function Control({ label, accessibilityLabel, active, onPress }: { label: string; accessibilityLabel: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="radio" accessibilityLabel={accessibilityLabel} accessibilityState={{ checked: active }} onPress={onPress} style={[styles.control, active && styles.controlActive]}><Text style={[styles.controlText, active && styles.controlTextActive]}>{label}</Text></Pressable>; }

function LiveEvents({ rows, largeText, onReset, onOpen }: { rows: TrackNotification[]; largeText: boolean; onReset: () => void; onOpen: (address: string) => void }) {
  const { t } = useSettings();
  if (!rows.length) return <View style={styles.state}><Ionicons name="filter" size={24} color={colors.muted} /><Text style={styles.stateText}>{t("noWhaleFilterMatches")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("resetWhaleFilters")} onPress={onReset} style={styles.secondary}><Text style={styles.secondaryText}>{t("resetWhaleFilters")}</Text></Pressable></View>;
  return <View>{rows.map((item) => {
    const buy = item.type.endsWith("buy");
    const whale = whaleHoldingIdentity(item);
    const amount = item.amountUsd == null ? "—" : compactUsd(item.amountUsd);
    return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={t("openWhaleRelationship", { holder: whale?.label ?? t("unverifiedWhale"), holding: whale?.tokenSymbol ?? t("unknownToken"), action: t(buy ? "bought" : "sold"), amount, traded: item.tokenSymbol, dex: item.market.dex ?? t("unknownDex") })} onPress={() => onOpen(item.tokenAddress)} style={[styles.card, largeText && { alignItems: "flex-start" }, { borderLeftWidth: 3, borderLeftColor: buy ? colors.positive : colors.negative }]}>
      <View style={{ width: 42, alignItems: "center", gap: 3 }}>
        <TokenAvatar symbol={whale?.tokenSymbol ?? "?"} identity={whale?.tokenAddress ?? item.wallet ?? item.id} imageUrl={whale?.imageUrl} size={38} accessible={false} />
        <Text numberOfLines={1} style={{ maxWidth: 42, color: colors.muted, fontSize: 7, fontWeight: "900" }}>{whale?.tokenSymbol ?? "—"}</Text>
      </View>
      <View style={[styles.flex, largeText && { minWidth: 0 }]}>
        <View style={styles.row}><Text numberOfLines={1} style={styles.cardTitle}>{whale?.label ?? t("unverifiedWhale")}</Text><Text style={styles.meta}>{ageLabel(item.observedAt)}</Text></View>
        <Text style={[styles.actionText, { color: buy ? colors.positive : colors.negative }]}>{t(buy ? "bought" : "sold")} {amount} {item.tokenSymbol}</Text>
        {whale ? <Text style={styles.meta}>{t("whaleHolds", { amount: compactUsd(whale.valueUsd), symbol: whale.tokenSymbol })}</Text> : null}
        <MarketSnapshot item={item} compact />
        <Text numberOfLines={1} style={styles.evidence}>{item.wallet ? short(item.wallet) : item.source} · {item.source} · {item.dataQuality}</Text>
        {whaleAmountContext(item) === "amount_exceeds_market_cap" ? <Text style={{ color: colors.warning, fontSize: 8, marginTop: 5 }}>{t("whaleAmountContextWarning")}</Text> : null}
      </View>
      <View style={{ width: 42, alignItems: "center", gap: 3 }}>
        <View style={{ position: "relative" }}><TokenAvatar symbol={item.tokenSymbol} identity={item.tokenAddress} imageUrl={item.market.imageUrl} size={38} accessible={false} /><DexBadge dex={item.market.dex} /></View>
        <Text numberOfLines={1} style={{ maxWidth: 42, color: colors.muted, fontSize: 7, fontWeight: "900" }}>{item.tokenSymbol}</Text>
      </View>
    </Pressable>;
  })}</View>;
}

function DexBadge({ dex }: { dex?: string | null }) {
  return <View style={{ position: "absolute", right: -4, bottom: -4 }}><DexLogo dex={dex} size={18} accessible={false} /></View>;
}

export function WhaleFeedUnavailable({ reason, onWallets }: { reason?: string; onWallets: () => void }) {
  const { t } = useSettings();
  const unconfigured = reason === "eligible_token_allowlist_unconfigured";
  return <View accessible accessibilityRole="summary" style={styles.notice}><Ionicons name={unconfigured ? "settings-outline" : "cloud-offline-outline"} size={24} color={colors.warning} /><Text style={styles.noticeTitle}>{t(unconfigured ? "whaleAllowlistMissingTitle" : "whaleFeedUnavailableTitle")}</Text><Text style={styles.noticeText}>{t(unconfigured ? "whaleAllowlistMissingBody" : "whaleFeedUnavailableBody")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("viewRankedWhaleWallets")} onPress={onWallets} style={styles.primary}><Text style={styles.primaryText}>{t("viewRankedWhaleWallets")}</Text></Pressable></View>;
}

function MarketSnapshot({ item, compact = false }: { item: TrackNotification; compact?: boolean }) {
  const { t } = useSettings();
  const price = item.market.priceUsd == null ? "—" : tokenPrice(item.market.priceUsd);
  const marketCap = compactUsd(item.market.marketCap);
  const change = item.market.change1h == null ? "—" : signedPercent(item.market.change1h);
  const positive = (item.market.change1h ?? 0) >= 0;
  const chip = { paddingHorizontal: compact ? 5 : 7, paddingVertical: 3, borderRadius: 6 } as const;
  const unavailable = item.market.priceUsd == null && item.market.marketCap == null && item.market.change1h == null;
  return <View accessible accessibilityLabel={t("whaleMarketSnapshot", { price, marketCap, change })} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: compact ? 4 : 6, marginTop: compact ? 5 : 7 }}>{unavailable ? <Text style={[chip, { color: colors.muted, backgroundColor: colors.surfaceRaised, fontSize: 7, fontWeight: "800" }]}>{t("marketUnavailable")}</Text> : <><Text style={[chip, { color: colors.cyan, backgroundColor: colors.cyanDim, fontSize: 7, fontWeight: "800" }]}>{t("tokenPriceShort")} {price}</Text><Text style={[chip, { color: colors.violet, backgroundColor: colors.violetDim, fontSize: 7, fontWeight: "800" }]}>MC {marketCap}</Text><Text style={[chip, { color: positive ? colors.positive : colors.negative, backgroundColor: positive ? colors.accentDim : "#3a1820", fontSize: 7, fontWeight: "900" }]}>1h {change}</Text></>}</View>;
}

function FlowList({ rows, onOpen }: { rows: WhaleFlow[]; onOpen: (address: string) => void }) {
  const { t } = useSettings();
  if (!rows.length) return <State text={t("noWhaleFlow")} />;
  return <View>{rows.map((item, index) => <Pressable key={item.tokenAddress} accessibilityRole="button" accessibilityLabel={t("openWhaleFlow", { symbol: item.tokenSymbol })} onPress={() => onOpen(item.tokenAddress)} style={styles.flowCard}><View style={styles.row}><View style={styles.rankMini}><Text style={styles.rankMiniText}>{index + 1}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{item.tokenSymbol}</Text><Text style={styles.meta}>{t("whaleRank", { rank: index + 1 })}</Text></View><Text style={[styles.amount, { color: item.netUsd >= 0 ? colors.positive : colors.negative }]}>{item.netUsd >= 0 ? "+" : ""}{compactUsd(item.netUsd)}</Text></View><View style={styles.metrics}><Metric label={t("whaleBuys")} value={`${item.buys} · ${compactUsd(item.buyUsd)}`} /><Metric label={t("whaleSells")} value={`${item.sells} · ${compactUsd(item.sellUsd)}`} /><Metric label={t("uniqueWallets")} value={String(item.uniqueWallets)} /></View><Text style={styles.evidence}>{t("lastObserved")}: {new Date(item.latestObservedAt).toLocaleString()}</Text></Pressable>)}</View>;
}

function WalletRankings({ rows, hasEvidence, loading, refreshing, error, onRetry, onOpenAll, onOpen }: { rows: TopTrader[]; hasEvidence: boolean; loading: boolean; refreshing: boolean; error: boolean; onRetry: () => void; onOpenAll: () => void; onOpen: (address: string) => void }) {
  const { t } = useSettings();
  if (loading) return <State text={t("loadingWalletRankings")} />;
  if (error) return <State error text={t("whaleLoadFailed")} retrying={refreshing} onRetry={onRetry} />;
  if (!rows.length) return <State text={t(hasEvidence ? "noWhaleWalletSearchMatches" : "noSmartWallets")} />;
  return <View>{rows.slice(0, 20).map((item) => <Pressable key={item.address} accessibilityRole="button" accessibilityLabel={t("inspectWallet", { badge: item.badge, address: item.address })} onPress={() => onOpen(item.address)} style={styles.card}><View style={styles.rank}><Text style={styles.rankText}>{item.rank}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{item.bestToken || t("unknownToken")} · {item.badge}</Text><Text style={styles.walletText}>{short(item.address)}</Text><Text style={styles.meta}>{item.trades} {t("observedTrades")} · {item.winRate.toFixed(1)}% {t("winRate")}</Text></View><View style={styles.eventContext}><Text style={[styles.amount, { color: item.pnlUsd >= 0 ? colors.positive : colors.negative }]}>{compactUsd(item.pnlUsd)}</Text><Text style={styles.meta}>{t("bestObservedToken")}</Text></View></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel={t("openWalletIntelligence")} onPress={onOpenAll} style={styles.primary}><Text style={styles.primaryText}>{t("openWalletIntelligence")}</Text></Pressable></View>;
}

function AlertsHandoff({ onOpen }: { onOpen: () => void }) { const { t } = useSettings(); return <View style={styles.notice}><Ionicons name="notifications-outline" size={24} color={colors.warning} /><Text style={styles.noticeTitle}>{t("whaleAlertsNotSupported")}</Text><Text style={styles.noticeText}>{t("whaleAlertsBoundary")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("openAlertManagement")} onPress={onOpen} style={styles.primary}><Text style={styles.primaryText}>{t("openAlertManagement")}</Text></Pressable></View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function State({ text, error, retrying = false, onRetry }: { text: string; error?: boolean; retrying?: boolean; onRetry?: () => void }) { const { t } = useSettings(); return <View accessible accessibilityRole={error ? "alert" : "summary"} style={styles.state}><Ionicons name={error ? "warning" : "pulse"} size={24} color={error ? colors.negative : colors.muted} /><Text style={styles.stateText}>{text}</Text>{onRetry ? <Pressable accessibilityRole="button" accessibilityLabel={t("retry")} accessibilityState={{ busy: retrying, disabled: retrying }} disabled={retrying} onPress={onRetry} style={[styles.secondary, retrying && styles.disabled]}><Text style={styles.secondaryText}>{retrying ? t("loadingWhaleActivity") : t("retry")}</Text></Pressable> : null}</View>; }
const short = (value: string) => value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
const ageLabel = (observedAt: number) => { const timestamp = observedAt < 1_000_000_000_000 ? observedAt * 1000 : observedAt; const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000)); if (seconds < 60) return `${seconds}s`; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m`; const hours = Math.floor(minutes / 60); return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`; };

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 90 }, flex: { flex: 1 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.positive }, stale: { backgroundColor: colors.warning }, statusText: { flex: 1, color: colors.muted, fontSize: 7, fontWeight: "800" }, searchRow: { flexDirection: "row", gap: spacing.sm }, searchBox: { flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, searchInput: { flex: 1, color: colors.text, fontSize: 10, paddingVertical: 0 }, chain: { minWidth: 72, minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, chainMark: { color: "#8b5cf6", fontSize: 18, fontWeight: "900" }, chainText: { color: colors.text, fontSize: 9, fontWeight: "900" }, tabRail: { marginVertical: spacing.sm }, tabs: { flexDirection: "row", gap: 5 }, tab: { minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, tabActive: { backgroundColor: colors.accentDim, borderColor: colors.accent }, tabText: { color: colors.muted, fontSize: 7, fontWeight: "800" }, tabTextActive: { color: colors.accent }, compactStatus: { minHeight: 24, flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.xs, paddingHorizontal: 4 }, preferenceError: { color: colors.negative, fontSize: 8, lineHeight: 13, marginBottom: spacing.sm }, controls: { marginBottom: spacing.sm }, reset: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 3, minHeight: 28 }, resetText: { color: colors.accent, fontSize: 8, fontWeight: "900", padding: 4 }, controlRow: { alignItems: "center", gap: 5 }, control: { minHeight: 32, justifyContent: "center", paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }, controlActive: { borderColor: "#8b5cf6", backgroundColor: "#2d1950" }, controlText: { color: colors.muted, fontSize: 7, fontWeight: "800" }, controlTextActive: { color: "#c4a7ff" }, controlDivider: { width: 1, height: 22, backgroundColor: colors.border, marginHorizontal: 2 }, card: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 9, marginBottom: 2, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }, cardTitle: { color: colors.text, fontSize: 11, fontWeight: "900" }, actionText: { fontSize: 9, fontWeight: "900", marginTop: 2, textTransform: "capitalize" }, walletText: { color: colors.text, fontSize: 8, fontWeight: "800", marginTop: 2 }, eventContext: { maxWidth: "46%", alignItems: "flex-end" }, amount: { fontSize: 10, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 8, marginTop: 3 }, evidenceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }, evidence: { flexShrink: 1, color: colors.muted, fontSize: 7, marginTop: 4 }, flowCard: { padding: spacing.lg, marginBottom: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, rankMini: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#2d1950" }, rankMiniText: { color: "#c4a7ff", fontSize: 9, fontWeight: "900" }, metrics: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }, metric: { flex: 1 }, metricLabel: { color: colors.muted, fontSize: 7 }, metricValue: { color: colors.text, fontSize: 9, fontWeight: "800", marginTop: 3 }, rank: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentDim }, rankText: { color: colors.accent, fontWeight: "900" }, primary: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, borderRadius: 10, backgroundColor: colors.accent, marginTop: spacing.md }, primaryText: { color: colors.background, fontSize: 9, fontWeight: "900" }, secondary: { minHeight: 40, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, borderRadius: 10, borderWidth: 1, borderColor: colors.accent }, secondaryText: { color: colors.accent, fontSize: 9, fontWeight: "900" }, disabled: { opacity: 0.55 }, notice: { alignItems: "center", padding: spacing.xl, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, noticeTitle: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: spacing.md }, noticeText: { color: colors.muted, fontSize: 9, lineHeight: 15, textAlign: "center", marginTop: spacing.sm }, state: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: spacing.md }, stateText: { color: colors.muted, textAlign: "center", lineHeight: 18 } });
