import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchOhlcv, fetchTokenDetail } from "@/api/client";
import { PriceChart } from "@/components/PriceChart";
import { signedPercent, tokenPrice } from "@/lib/format";
import { isSolanaAddress } from "@/security/input";
import { useSettings } from "@/settings/SettingsProvider";
import {
  addSnipeEntry,
  boundedResearchNumber,
  loadResearchWorkspace,
  removeSnipeEntry,
  saveResearchWorkspace,
  setChartSlot,
  updateSnipeEntry,
  type ResearchTimeframe,
  type ResearchWorkspace,
  type SnipeEntry,
} from "@/store/research";
import { colors, spacing } from "@/theme";

type Tab = "snipe" | "charts";
const timeframes: ResearchTimeframe[] = ["5m", "15m", "1h", "4h", "1d"];
const initial: ResearchWorkspace = { snipe: [], charts: [], timeframe: "15m" };

export default function ResearchWorkspaceScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const { t } = useSettings();
  const [tab, setTab] = useState<Tab>(
    params.tab === "charts" ? "charts" : "snipe",
  );
  const [workspace, setWorkspace] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storeError, setStoreError] = useState("");
  useEffect(() => {
    void loadResearchWorkspace().then((value) => {
      setWorkspace(value);
      setReady(true);
    });
  }, []);
  const persist = (next: ResearchWorkspace) => {
    setWorkspace(next);
    setStoreError("");
    void saveResearchWorkspace(next).catch(() =>
      setStoreError(t("storageUnavailable")),
    );
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("backResearch")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{t("deviceOnlyResearch")}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {t("researchWorkspace")}
            </Text>
          </View>
          <Text style={styles.noExec}>{t("noExecution")}</Text>
        </View>
        <View accessibilityRole="summary" style={styles.notice}>
          <Ionicons name="flask" size={15} color={colors.warning} />
          <Text style={styles.noticeText}>{t("researchSafety")}</Text>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          <TabButton
            label={t("snipeList")}
            accessibilityLabel={t("selectResearchTab", { tab: t("snipeList") })}
            active={tab === "snipe"}
            onPress={() => setTab("snipe")}
          />
          <TabButton
            label={t("multicharts")}
            accessibilityLabel={t("selectResearchTab", {
              tab: t("multicharts"),
            })}
            active={tab === "charts"}
            onPress={() => setTab("charts")}
          />
        </View>
        {!ready ? (
          <State loading text={t("loadingResearch")} />
        ) : tab === "snipe" ? (
          <SnipeList
            workspace={workspace}
            persist={persist}
            onToken={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        ) : (
          <Multicharts
            workspace={workspace}
            persist={persist}
            onToken={(address) =>
              router.push({ pathname: "/token/[address]", params: { address } })
            }
          />
        )}
        {storeError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {storeError}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SnipeList({
  workspace,
  persist,
  onToken,
}: {
  workspace: ResearchWorkspace;
  persist: (next: ResearchWorkspace) => void;
  onToken: (address: string) => void;
}) {
  const { t } = useSettings();
  const [draft, setDraft] = useState("");
  const valid = isSolanaAddress(draft.trim());
  const add = () => {
    try {
      persist(addSnipeEntry(workspace, draft.trim()));
      setDraft("");
    } catch {}
  };
  return (
    <View>
      <View style={styles.addBox}>
        <View style={styles.addTop}>
          <View>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {t("snipeList")}
            </Text>
            <Text style={styles.meta}>
              {t("deviceCandidates", { count: workspace.snipe.length })}
            </Text>
          </View>
          <Ionicons name="locate" size={20} color={colors.negative} />
        </View>
        <TextInput
          accessibilityLabel={t("snipeAddress")}
          value={draft}
          onChangeText={(value) => setDraft(value.slice(0, 44))}
          maxLength={44}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t("exactTokenMint")}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("addSnipe")}
          accessibilityState={{ disabled: !valid }}
          disabled={!valid}
          onPress={add}
          style={[styles.action, !valid && styles.disabled]}
        >
          <Text style={styles.actionText}>{t("addCandidate")}</Text>
        </Pressable>
        {draft.length > 0 && !valid ? (
          <Text accessibilityRole="alert" style={styles.errorInline}>
            {t("exact32Bytes")}
          </Text>
        ) : null}
      </View>
      {workspace.snipe.map((entry) => (
        <SnipeCard
          key={entry.address}
          entry={entry}
          onUpdate={(patch) =>
            persist(updateSnipeEntry(workspace, entry.address, patch))
          }
          onRemove={() => persist(removeSnipeEntry(workspace, entry.address))}
          onOpen={() => onToken(entry.address)}
        />
      ))}
      {!workspace.snipe.length ? (
        <State text={t("noCandidatesResearch")} />
      ) : null}
      <Text accessibilityRole="summary" style={styles.boundary}>
        {t("researchBoundary")}
      </Text>
    </View>
  );
}
export function SnipeCard({
  entry,
  onUpdate,
  onRemove,
  onOpen,
}: {
  entry: SnipeEntry;
  onUpdate: (
    patch: Partial<Pick<SnipeEntry, "notes" | "above" | "below">>,
  ) => void;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const { t } = useSettings();
  const token = useQuery({
    queryKey: ["token-detail", entry.address],
    queryFn: ({ signal }) => fetchTokenDetail(entry.address, signal),
    refetchInterval: 30_000,
  });
  const [above, setAbove] = useState(entry.above?.toString() ?? "");
  const [below, setBelow] = useState(entry.below?.toString() ?? "");
  const data = token.data?.token;
  const aboveHit = Boolean(
    data && entry.above != null && data.price >= entry.above,
  );
  const belowHit = Boolean(
    data && entry.below != null && data.price <= entry.below,
  );
  const saveThreshold = (field: "above" | "below", value: string) => {
    const parsed = value.trim() ? Number(value) : null;
    onUpdate({
      [field]:
        parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    });
  };
  return (
    <View style={[styles.card, (aboveHit || belowHit) && styles.hitCard]}>
      <View style={styles.cardTop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("openTokenResearch", {
            symbol: data?.symbol ?? t("candidate"),
          })}
          onPress={onOpen}
          style={styles.tokenMain}
        >
          <View style={styles.tokenIcon}>
            <Text style={styles.tokenIconText}>
              {data?.symbol.slice(0, 2) ?? "?"}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              {data ? `${data.symbol} · ${data.name}` : short(entry.address)}
            </Text>
            <Text style={styles.meta}>
              {token.isLoading
                ? t("loadingTokenEvidence")
                : token.error
                  ? t("tokenUnavailable")
                  : data
                    ? `${tokenPrice(data.price)} · ${signedPercent(data.change24h)}`
                    : t("tokenUnavailable")}
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("removeSnipe")}
          onPress={onRemove}
          style={styles.remove}
        >
          <Ionicons name="trash" size={14} color={colors.negative} />
        </Pressable>
      </View>
      {token.error ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("retry")}
          accessibilityState={{ busy: token.isFetching, disabled: token.isFetching }}
          disabled={token.isFetching}
          onPress={() => token.refetch()}
          style={[styles.snipeRetry, token.isFetching && styles.disabled]}
        >
          <Text style={styles.snipeRetryText}>{t("retry")}</Text>
        </Pressable>
      ) : null}
      {aboveHit || belowHit ? (
        <View accessibilityRole="summary" style={styles.hit}>
          <Ionicons name="eye" size={12} color={colors.warning} />
          <Text style={styles.hitText}>
            {t("visualThresholdMet", {
              direction: aboveHit ? t("above") : t("below"),
            })}
          </Text>
        </View>
      ) : null}
      <View style={styles.thresholds}>
        <View style={styles.threshold}>
          <Text style={styles.fieldLabel}>{t("visualAboveUsd")}</Text>
          <TextInput
            accessibilityLabel={t("visualAboveLabel")}
            value={above}
            onChangeText={(value) => setAbove(boundedResearchNumber(value))}
            maxLength={19}
            onEndEditing={() => saveThreshold("above", above)}
            keyboardType="decimal-pad"
            placeholder={t("none")}
            placeholderTextColor={colors.muted}
            style={styles.smallInput}
          />
        </View>
        <View style={styles.threshold}>
          <Text style={styles.fieldLabel}>{t("visualBelowUsd")}</Text>
          <TextInput
            accessibilityLabel={t("visualBelowLabel")}
            value={below}
            onChangeText={(value) => setBelow(boundedResearchNumber(value))}
            maxLength={19}
            onEndEditing={() => saveThreshold("below", below)}
            keyboardType="decimal-pad"
            placeholder={t("none")}
            placeholderTextColor={colors.muted}
            style={styles.smallInput}
          />
        </View>
      </View>
      <TextInput
        accessibilityLabel={t("candidateNotes")}
        defaultValue={entry.notes}
        onEndEditing={(event) => onUpdate({ notes: event.nativeEvent.text })}
        maxLength={120}
        multiline
        placeholder={t("researchNotesPlaceholder")}
        placeholderTextColor={colors.muted}
        style={styles.notes}
      />
    </View>
  );
}

function Multicharts({
  workspace,
  persist,
  onToken,
}: {
  workspace: ResearchWorkspace;
  persist: (next: ResearchWorkspace) => void;
  onToken: (address: string) => void;
}) {
  const { t } = useSettings();
  const [draft, setDraft] = useState("");
  const valid = isSolanaAddress(draft.trim());
  const add = () => {
    try {
      persist(
        setChartSlot(
          workspace,
          Math.min(workspace.charts.length, 3),
          draft.trim(),
        ),
      );
      setDraft("");
    } catch {}
  };
  const remove = (address: string) =>
    persist({
      ...workspace,
      charts: workspace.charts.filter((item) => item !== address),
    });
  return (
    <View>
      <View style={styles.chartHeader}>
        <View>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t("multicharts")}
          </Text>
          <Text style={styles.meta}>
            {t("realChartsShared", { count: workspace.charts.length })}
          </Text>
        </View>
        <Ionicons name="grid" size={20} color={colors.accent} />
      </View>
      <ScrollView
        accessibilityRole="radiogroup"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeframes}
      >
        {timeframes.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={t("selectChartTimeframe", { timeframe: value })}
            accessibilityState={{ checked: workspace.timeframe === value }}
            onPress={() => persist({ ...workspace, timeframe: value })}
            style={[
              styles.timeframe,
              workspace.timeframe === value && styles.active,
            ]}
          >
            <Text
              style={[
                styles.timeframeText,
                workspace.timeframe === value && styles.activeText,
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {workspace.charts.length < 4 ? (
        <View style={styles.chartAdd}>
          <TextInput
            accessibilityLabel={t("multichartAddress")}
            value={draft}
            onChangeText={(value) => setDraft(value.slice(0, 44))}
            maxLength={44}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t("addExactMint")}
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.flex]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("addTokenChart")}
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={add}
            style={[styles.addButton, !valid && styles.disabled]}
          >
            <Ionicons name="add" size={18} color={colors.background} />
          </Pressable>
        </View>
      ) : null}
      {workspace.charts.map((address) => (
        <ChartPanel
          key={address}
          address={address}
          timeframe={workspace.timeframe}
          onOpen={() => onToken(address)}
          onRemove={() => remove(address)}
        />
      ))}
      {!workspace.charts.length ? <State text={t("noCharts")} /> : null}
    </View>
  );
}
function ChartPanel({
  address,
  timeframe,
  onOpen,
  onRemove,
}: {
  address: string;
  timeframe: ResearchTimeframe;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const { t } = useSettings();
  const token = useQuery({
    queryKey: ["token-detail", address],
    queryFn: ({ signal }) => fetchTokenDetail(address, signal),
  });
  const chart = useQuery({
    queryKey: ["ohlcv", address, timeframe],
    queryFn: ({ signal }) => fetchOhlcv(address, timeframe, signal),
    staleTime: 15_000,
  });
  const refreshing = token.isRefetching || chart.isRefetching;
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartTop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("openChartToken", {
            symbol: token.data?.token?.symbol ?? t("chartCandidate"),
          })}
          onPress={onOpen}
          style={styles.flex}
        >
          <Text style={styles.cardTitle}>
            {token.data?.token
              ? `${token.data.token.symbol} / ${token.data.token.quoteSymbol}`
              : short(address)}
          </Text>
          <Text style={styles.meta}>
            {token.data?.token
              ? `${tokenPrice(token.data.token.price)} · ${signedPercent(token.data.token.change24h)}`
              : token.error
                ? t("tokenUnavailable")
                : t("loadingTokenIdentity")}
          </Text>
        </Pressable>
        <RefreshChartButton
          refreshing={refreshing}
          label={t("refreshChart")}
          onPress={() => {
            void token.refetch();
            void chart.refetch();
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("removeChart")}
          onPress={onRemove}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={15} color={colors.negative} />
        </Pressable>
      </View>
      {chart.isLoading ? (
        <State loading text={t("loadingValidatedCandles")} />
      ) : chart.error ? (
        <State
          error
          text={t("chartUnavailable")}
          action={t("retry")}
          actionBusy={chart.isFetching}
          onAction={() => chart.refetch()}
        />
      ) : chart.data ? (
        <PriceChart data={chart.data} compact />
      ) : null}
    </View>
  );
}

export function RefreshChartButton({
  refreshing,
  label,
  onPress,
}: {
  refreshing: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: refreshing, busy: refreshing }}
      disabled={refreshing}
      onPress={onPress}
      style={styles.iconButton}
    >
      {refreshing ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons name="refresh" size={14} color={colors.accent} />
      )}
    </Pressable>
  );
}

function TabButton({
  label,
  accessibilityLabel,
  active,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function State({
  loading,
  error,
  text,
  action,
  actionBusy = false,
  onAction,
}: {
  loading?: boolean;
  error?: boolean;
  text: string;
  action?: string;
  actionBusy?: boolean;
  onAction?: () => void;
}) {
  return (
    <View
      accessible
      accessibilityRole={error ? "alert" : "summary"}
      accessibilityLiveRegion="polite"
      accessibilityState={loading ? { busy: true } : undefined}
      style={styles.state}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Ionicons name="information-circle" size={20} color={colors.muted} />
      )}
      <Text style={styles.stateText}>{text}</Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          accessibilityState={{ busy: actionBusy, disabled: actionBusy }}
          disabled={actionBusy}
          onPress={onAction}
          style={[styles.stateAction, actionBusy && styles.disabled]}
        >
          <Text style={styles.stateActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function short(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-5)}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 90 },
  header: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  flex: { flex: 1 },
  eyebrow: {
    color: "#ff8b94",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: { color: colors.text, fontSize: 23, fontWeight: "900" },
  noExec: {
    color: colors.negative,
    fontSize: 7,
    fontWeight: "900",
    borderWidth: 1,
    borderColor: "#5a2630",
    borderRadius: 7,
    padding: 6,
  },
  notice: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#5a4720",
    backgroundColor: "#241d10",
  },
  noticeText: { flex: 1, color: colors.warning, fontSize: 9, lineHeight: 14 },
  tabs: {
    margin: spacing.lg,
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 9 },
  tabActive: { backgroundColor: "#3b1b21" },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  tabTextActive: { color: "#ff8b94" },
  addBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#5a2630",
    borderRadius: 13,
    backgroundColor: "#1d1114",
  },
  addTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 8, marginTop: 3 },
  input: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 10,
  },
  action: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.negative,
  },
  actionText: { color: colors.background, fontSize: 9, fontWeight: "900" },
  disabled: { opacity: 0.35 },
  error: {
    marginHorizontal: spacing.lg,
    color: colors.negative,
    fontSize: 8,
    textAlign: "center",
  },
  errorInline: { color: colors.negative, fontSize: 8 },
  snipeRetry: { minHeight: 44, alignSelf: "flex-start", paddingHorizontal: spacing.lg, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.accent },
  snipeRetryText: { color: colors.accent, fontWeight: "900" },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  hitCard: { borderColor: "#6d5420" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  tokenMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tokenIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#3b1b21",
  },
  tokenIconText: { color: "#ff8b94", fontSize: 9, fontWeight: "900" },
  cardTitle: { color: colors.text, fontSize: 10, fontWeight: "900" },
  remove: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  hit: {
    marginTop: spacing.sm,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    backgroundColor: "#2d2715",
  },
  hitText: { color: colors.warning, fontSize: 7, fontWeight: "900" },
  thresholds: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  threshold: { flex: 1 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 7,
    fontWeight: "800",
    marginBottom: 4,
  },
  smallInput: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 10,
  },
  notes: {
    minHeight: 54,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 9,
    textAlignVertical: "top",
  },
  boundary: {
    margin: spacing.xl,
    color: colors.muted,
    fontSize: 8,
    lineHeight: 13,
    textAlign: "center",
  },
  chartHeader: {
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeframes: { padding: spacing.lg, gap: 6 },
  timeframe: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.accent },
  timeframeText: { color: colors.muted, fontSize: 9, fontWeight: "900" },
  activeText: { color: colors.background },
  chartAdd: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  addButton: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  chartTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  state: {
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  stateText: { color: colors.muted, textAlign: "center", lineHeight: 18 },
  stateAction: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  stateActionText: { color: colors.background, fontWeight: "900" },
});
