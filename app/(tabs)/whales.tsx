import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchTopTraders, fetchTrackFeed } from "@/api/client";
import type { TopTrader, TrackNotification } from "@/api/schema";
import { compactUsd } from "@/lib/format";
import { aggregateWhaleActivity, isWhaleActivity, type WhaleFlow } from "@/lib/whale-activity";
import { useSettings } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

type Mode = "live" | "accumulating" | "distributing" | "wallets" | "alerts";
const modes: Mode[] = ["live", "accumulating", "distributing", "wallets", "alerts"];

export default function WhalesScreen() {
  const { t } = useSettings();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("live");
  const feed = useQuery({ queryKey: ["whale-activity"], queryFn: ({ signal }) => fetchTrackFeed(signal), refetchInterval: 30_000 });
  const rankings = useQuery({ queryKey: ["whale-wallet-rankings"], queryFn: ({ signal }) => fetchTopTraders("30D", signal), enabled: mode === "wallets" });
  const events = useMemo(() => (feed.data?.notifications ?? []).filter(isWhaleActivity).sort((a, b) => b.observedAt - a.observedAt), [feed.data]);
  const flows = useMemo(() => aggregateWhaleActivity(events), [events]);
  const wallets = useMemo(() => (rankings.data?.traders ?? []).filter((item) => item.badge === "Whale" || item.badge === "Smart Money"), [rankings.data]);
  const refresh = () => mode === "wallets" ? rankings.refetch() : feed.refetch();
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <ScrollView refreshControl={<RefreshControl refreshing={feed.isRefetching || rankings.isRefetching} onRefresh={refresh} tintColor={colors.accent} />} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.heroIcon}><Ionicons name="water" size={22} color={colors.accent} /></View>
        <View style={styles.flex}><Text style={styles.eyebrow}>TERMINAL DEX · ONCHAIN INTELLIGENCE</Text><Text accessibilityRole="header" style={styles.title}>{t("whales")}</Text><Text style={styles.subtitle}>{t("whaleObjective")}</Text></View>
        <View accessibilityRole="summary" style={styles.status}><View style={[styles.dot, feed.data?.coverage?.whaleTransactions.dataQuality === "no_recent_records" && styles.stale]} /><Text style={styles.statusText}>{feed.data?.coverage?.whaleTransactions.recordCount ?? 0} LIVE</Text></View>
      </View>
      <View accessibilityRole="tablist" style={styles.tabs}>{modes.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: mode === item }} accessibilityLabel={t("selectWhaleView", { view: t(`whaleMode_${item}`) })} onPress={() => setMode(item)} style={[styles.tab, mode === item && styles.tabActive]}><Text style={[styles.tabText, mode === item && styles.tabTextActive]}>{t(`whaleMode_${item}`)}</Text></Pressable>)}</View>
      <Text accessibilityRole="summary" style={styles.boundary}>{t("whaleEvidenceBoundary")}</Text>
      {mode === "wallets" ? <WalletRankings rows={wallets} loading={rankings.isLoading} error={rankings.error?.message} onOpen={() => router.push("/wallet-intelligence")} /> : mode === "alerts" ? <AlertsHandoff onOpen={() => router.push("/(tabs)/monitor")} /> : feed.isLoading ? <State text={t("loadingWhaleActivity")} /> : feed.isError ? <State error text={feed.error.message} /> : mode === "live" ? <LiveEvents rows={events} onOpen={(address) => router.push({ pathname: "/token/[address]", params: { address } })} /> : <FlowList rows={flows.filter((item) => mode === "accumulating" ? item.netUsd > 0 : item.netUsd < 0)} onOpen={(address) => router.push({ pathname: "/token/[address]", params: { address } })} />}
    </ScrollView>
  </SafeAreaView>;
}

function LiveEvents({ rows, onOpen }: { rows: TrackNotification[]; onOpen: (address: string) => void }) {
  const { t } = useSettings();
  if (!rows.length) return <State text={t("noWhaleActivity")} />;
  return <View>{rows.map((item) => { const buy = item.type.endsWith("buy"); return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={t("openWhaleEvent", { symbol: item.tokenSymbol })} onPress={() => onOpen(item.tokenAddress)} style={styles.card}>
    <View style={[styles.direction, { backgroundColor: buy ? colors.accentDim : "#401b24" }]}><Ionicons name={buy ? "arrow-down" : "arrow-up"} size={17} color={buy ? colors.positive : colors.negative} /></View>
    <View style={styles.flex}><View style={styles.row}><Text style={styles.cardTitle}>{item.tokenSymbol} · {t(buy ? "whaleBuy" : "whaleSell")}</Text><Text style={[styles.amount, { color: buy ? colors.positive : colors.negative }]}>{item.amountUsd == null ? "—" : compactUsd(item.amountUsd)}</Text></View><Text style={styles.meta}>{item.wallet ? short(item.wallet) : t("classifiedWallet")} · {new Date(item.observedAt).toLocaleString()}</Text><Text style={styles.evidence}>{item.source} · {item.dataQuality}{item.market.marketCap != null ? ` · MC ${compactUsd(item.market.marketCap)}` : ""}</Text></View>
  </Pressable>; })}</View>;
}

function FlowList({ rows, onOpen }: { rows: WhaleFlow[]; onOpen: (address: string) => void }) {
  const { t } = useSettings();
  if (!rows.length) return <State text={t("noWhaleFlow")} />;
  return <View>{rows.map((item) => <Pressable key={item.tokenAddress} accessibilityRole="button" accessibilityLabel={t("openWhaleFlow", { symbol: item.tokenSymbol })} onPress={() => onOpen(item.tokenAddress)} style={styles.flowCard}><View style={styles.row}><Text style={styles.cardTitle}>{item.tokenSymbol}</Text><Text style={[styles.amount, { color: item.netUsd >= 0 ? colors.positive : colors.negative }]}>{item.netUsd >= 0 ? "+" : ""}{compactUsd(item.netUsd)}</Text></View><View style={styles.metrics}><Metric label={t("whaleBuys")} value={`${item.buys} · ${compactUsd(item.buyUsd)}`} /><Metric label={t("whaleSells")} value={`${item.sells} · ${compactUsd(item.sellUsd)}`} /><Metric label={t("uniqueWallets")} value={String(item.uniqueWallets)} /></View><Text style={styles.evidence}>{t("lastObserved")}: {new Date(item.latestObservedAt).toLocaleString()}</Text></Pressable>)}</View>;
}

function WalletRankings({ rows, loading, error, onOpen }: { rows: TopTrader[]; loading: boolean; error?: string; onOpen: () => void }) {
  const { t } = useSettings();
  if (loading) return <State text={t("loadingWalletRankings")} />;
  if (error) return <State error text={error} />;
  return <View>{rows.slice(0, 20).map((item) => <Pressable key={item.address} accessibilityRole="button" accessibilityLabel={t("inspectWallet", { badge: item.badge, address: item.address })} onPress={onOpen} style={styles.card}><View style={styles.rank}><Text style={styles.rankText}>{item.rank}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{short(item.address)} · {item.badge}</Text><Text style={styles.meta}>{item.trades} {t("observedTrades")} · {item.winRate.toFixed(1)}% {t("winRate")}</Text></View><Text style={[styles.amount, { color: item.pnlUsd >= 0 ? colors.positive : colors.negative }]}>{compactUsd(item.pnlUsd)}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel={t("openWalletIntelligence")} onPress={onOpen} style={styles.primary}><Text style={styles.primaryText}>{t("openWalletIntelligence")}</Text></Pressable></View>;
}

function AlertsHandoff({ onOpen }: { onOpen: () => void }) { const { t } = useSettings(); return <View style={styles.notice}><Ionicons name="notifications-outline" size={24} color={colors.warning} /><Text style={styles.noticeTitle}>{t("whaleAlertsNotSupported")}</Text><Text style={styles.noticeText}>{t("whaleAlertsBoundary")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("openAlertManagement")} onPress={onOpen} style={styles.primary}><Text style={styles.primaryText}>{t("openAlertManagement")}</Text></Pressable></View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function State({ text, error }: { text: string; error?: boolean }) { return <View accessible accessibilityRole={error ? "alert" : "summary"} style={styles.state}><Ionicons name={error ? "warning" : "pulse"} size={24} color={error ? colors.negative : colors.muted} /><Text style={styles.stateText}>{text}</Text></View>; }
const short = (value: string) => value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, paddingBottom: 100 }, header: { flexDirection: "row", alignItems: "center", gap: spacing.md }, heroIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accent }, flex: { flex: 1 }, eyebrow: { color: colors.accent, fontSize: 7, fontWeight: "900", letterSpacing: 1.1 }, title: { color: colors.text, fontSize: 28, fontWeight: "900" }, subtitle: { color: colors.muted, fontSize: 9, marginTop: 2 }, status: { alignItems: "center", gap: 4 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.positive }, stale: { backgroundColor: colors.warning }, statusText: { color: colors.muted, fontSize: 7, fontWeight: "800" }, tabs: { flexDirection: "row", marginVertical: spacing.lg, gap: 5 }, tab: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, tabActive: { backgroundColor: colors.accentDim, borderColor: colors.accent }, tabText: { color: colors.muted, fontSize: 7, fontWeight: "800" }, tabTextActive: { color: colors.accent }, boundary: { color: colors.warning, fontSize: 8, lineHeight: 13, marginBottom: spacing.md }, card: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, direction: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }, cardTitle: { color: colors.text, fontSize: 11, fontWeight: "900" }, amount: { fontSize: 10, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 8, marginTop: 4 }, evidence: { color: colors.muted, fontSize: 7, marginTop: 5 }, flowCard: { padding: spacing.lg, marginBottom: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, metrics: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }, metric: { flex: 1 }, metricLabel: { color: colors.muted, fontSize: 7 }, metricValue: { color: colors.text, fontSize: 9, fontWeight: "800", marginTop: 3 }, rank: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentDim }, rankText: { color: colors.accent, fontWeight: "900" }, primary: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, borderRadius: 10, backgroundColor: colors.accent, marginTop: spacing.md }, primaryText: { color: colors.background, fontSize: 9, fontWeight: "900" }, notice: { alignItems: "center", padding: spacing.xl, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, noticeTitle: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: spacing.md }, noticeText: { color: colors.muted, fontSize: 9, lineHeight: 15, textAlign: "center", marginTop: spacing.sm }, state: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: spacing.md }, stateText: { color: colors.muted, textAlign: "center", lineHeight: 18 } });
