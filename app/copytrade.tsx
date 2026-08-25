import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createPausedCopyTradeConfig,
  deleteCopyTradeConfig,
  fetchCopyExecutions,
  fetchCopyPositions,
  fetchCopyTradeConfigs,
  fetchCopyTradeHealth,
  fetchTopTraders,
  pauseCopyTradeConfig,
} from "@/api/client";
import type {
  CopyExecution,
  CopyPosition,
  CopyTradeConfig,
  TopTrader,
} from "@/api/schema";
import { compactUsd, signedPercent } from "@/lib/format";
import { publicErrorMessage } from "@/lib/public-error";
import {
  boundedCopyNumber,
  buildPausedCopyTradeInput,
  defaultCopyTradeDraft,
  type CopySizingMode,
  type CopyTradeDraft,
} from "@/lib/copytrade-config";
import { useWalletSession } from "@/security/WalletSessionProvider";
import { colors, spacing } from "@/theme";
import { useSettings } from "@/settings/SettingsProvider";
import {
  defaultCopyTradePreviewPreferences,
  loadCopyTradePreviewPreferences,
  saveCopyTradePreviewPreferences,
  validateCopyTradePreviewPreferences,
  type CopyTradePreviewPreferences,
} from "@/store/copytrade-preview";

type Tab = "rank" | "strategies" | "activity";
const tabs = [
  { id: "rank", key: "rank" },
  { id: "strategies", key: "strategies" },
  { id: "activity", key: "activity" },
] as const;

export default function CopyTradeScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const wallet = useWalletSession();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("rank");
  const [period, setPeriod] = useState<"1D" | "7D" | "30D">("30D");
  const [selected, setSelected] = useState<TopTrader | null>(null);
  const authorized = Boolean(wallet.session && !wallet.locked);
  const health = useQuery({
    queryKey: ["copytrade-health"],
    queryFn: ({ signal }) => fetchCopyTradeHealth(signal),
    refetchInterval: 30_000,
  });
  const rankings = useQuery({
    queryKey: ["top-traders", period],
    queryFn: ({ signal }) => fetchTopTraders(period, signal),
    refetchInterval: 60_000,
  });
  const configs = useQuery({
    queryKey: ["copytrade-configs"],
    queryFn: ({ signal }) => fetchCopyTradeConfigs(signal),
    enabled: authorized,
  });
  const positions = useQuery({
    queryKey: ["copytrade-positions"],
    queryFn: ({ signal }) => fetchCopyPositions(signal),
    enabled: authorized && tab === "activity",
  });
  const executions = useQuery({
    queryKey: ["copytrade-executions"],
    queryFn: ({ signal }) => fetchCopyExecutions(signal),
    enabled: authorized && tab === "activity",
  });
  const refresh = () =>
    Promise.all([
      health.refetch(),
      tab === "rank"
        ? rankings.refetch()
        : tab === "strategies"
          ? configs.refetch()
          : Promise.all([positions.refetch(), executions.refetch()]),
    ]);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["copytrade-configs"] });
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={
              health.isRefetching ||
              rankings.isRefetching ||
              configs.isRefetching ||
              positions.isRefetching ||
              executions.isRefetching
            }
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("backCopyTrade")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{t("guardedStrategies")}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              CopyTrade
            </Text>
          </View>
          <Readiness
            mode={health.data?.mode}
            durable={health.data?.readiness.durableStorage}
          />
        </View>
        <View accessibilityRole="summary" style={styles.safety}>
          <Ionicons name="shield-checkmark" size={15} color={colors.warning} />
          <Text style={styles.safetyText}>{t("copyTradeSafety")}</Text>
        </View>
        {health.error ? (
          <State
            compact
            error
            text={t("evidenceLoadFailed")}
            action={t("retry")}
            actionBusy={health.isFetching}
            onAction={() => health.refetch()}
          />
        ) : null}
        <View accessibilityRole="tablist" style={styles.tabs}>
          {tabs.map((item) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={t("selectCopyTab", { tab: t(item.key) })}
              accessibilityState={{ selected: tab === item.id }}
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[styles.tab, tab === item.id && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === item.id && styles.tabTextActive,
                ]}
              >
                {t(item.key)}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab !== "rank" && !authorized ? (
          <IdentityGate
            locked={wallet.locked}
            busy={wallet.busy}
            error={wallet.error}
            onUnlock={wallet.unlock}
            onVerify={wallet.connectAndVerify}
          />
        ) : tab === "rank" ? (
          <Rankings
            data={rankings.data?.traders ?? []}
            loading={rankings.isLoading}
            error={rankings.error ? t("evidenceLoadFailed") : undefined}
            retrying={rankings.isFetching}
            onRetry={() => rankings.refetch()}
            source={rankings.data?.source}
            quality={rankings.data?.dataQuality}
            period={period}
            onPeriod={setPeriod}
            canConfigure={
              authorized && Boolean(health.data?.readiness.durableStorage)
            }
            onSelect={setSelected}
          />
        ) : tab === "strategies" ? (
          <Strategies
            data={configs.data ?? []}
            loading={configs.isLoading}
            error={configs.error ? t("evidenceLoadFailed") : undefined}
            retrying={configs.isFetching}
            onRetry={() => configs.refetch()}
            onChanged={invalidate}
          />
        ) : (
          <Activity
            positions={positions.data ?? []}
            executions={executions.data ?? []}
            loading={positions.isLoading || executions.isLoading}
            error={positions.error || executions.error ? t("evidenceLoadFailed") : undefined}
            retrying={positions.isFetching || executions.isFetching}
            onRetry={() => {
              if (positions.error) void positions.refetch();
              if (executions.error) void executions.refetch();
            }}
          />
        )}
        {selected ? (
          <StrategyComposer
            trader={selected}
            onClose={() => setSelected(null)}
            onCreated={() => {
              setSelected(null);
              invalidate();
              setTab("strategies");
            }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Rankings({
  data,
  loading,
  error,
  retrying,
  onRetry,
  source,
  quality,
  period,
  onPeriod,
  canConfigure,
  onSelect,
}: {
  data: TopTrader[];
  loading: boolean;
  error?: string;
  retrying: boolean;
  onRetry: () => void;
  source?: string;
  quality?: string;
  period: "1D" | "7D" | "30D";
  onPeriod: (value: "1D" | "7D" | "30D") => void;
  canConfigure: boolean;
  onSelect: (value: TopTrader) => void;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingTraderOutcomes")} />;
  if (error) return <State error text={error} action={t("retry")} actionBusy={retrying} onAction={onRetry} />;
  return (
    <View>
      <View style={styles.toolbar}>
        <View style={styles.flex}>
          <Text style={styles.provenance}>
            {t("sourceEvidence", {
              source: source ?? "none",
              quality: quality?.replaceAll("_", " ") ?? t("unavailable"),
            })}
          </Text>
          <Text style={styles.limitation}>{t("rankingLimitation")}</Text>
        </View>
        <View accessibilityRole="radiogroup" style={styles.periods}>
          {(["1D", "7D", "30D"] as const).map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={t("selectRankingPeriod", { period: item })}
              accessibilityState={{ checked: period === item }}
              key={item}
              onPress={() => onPeriod(item)}
              style={[styles.period, period === item && styles.periodActive]}
            >
              <Text
                style={[
                  styles.periodText,
                  period === item && styles.periodTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {data.map((trader) => (
        <TraderCard
          key={trader.address}
          trader={trader}
          canConfigure={canConfigure}
          onSelect={() => onSelect(trader)}
        />
      ))}
      {!data.length ? <State text={t("noRankings")} /> : null}
    </View>
  );
}
export function TraderCard({
  trader,
  canConfigure,
  onSelect,
}: {
  trader: TopTrader;
  canConfigure: boolean;
  onSelect: () => void;
}) {
  const { t } = useSettings();
  const wallet = short(trader.address);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.rank}>
          <Text style={styles.rankText}>{trader.rank}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.wallet}>{wallet}</Text>
          <Text style={styles.badge}>
            {trader.badge} · {t("closedOutcomes", { count: trader.trades })}
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.pnl,
              { color: trader.pnlUsd >= 0 ? colors.positive : colors.negative },
            ]}
          >
            {compactUsd(trader.pnlUsd)}
          </Text>
          <Text style={styles.pnlPct}>{signedPercent(trader.pnlPct)}</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <Metric label={t("winRate")} value={`${trader.winRate.toFixed(1)}%`} />
        <Metric
          label={t("drawdown")}
          value={
            trader.maxDrawdownPct == null
              ? "—"
              : `${trader.maxDrawdownPct.toFixed(1)}%`
          }
        />
        <Metric label={t("tokens")} value={String(trader.tokenCount ?? "—")} />
        <Metric label={t("best")} value={trader.bestToken} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("reviewCopying", { wallet })}
        accessibilityState={{ disabled: !canConfigure }}
        disabled={!canConfigure}
        onPress={onSelect}
        style={[styles.review, !canConfigure && styles.disabled]}
      >
        <Text style={styles.reviewText}>
          {canConfigure
            ? t("reviewPausedStrategy")
            : t("verifyDurableRequired")}
        </Text>
      </Pressable>
    </View>
  );
}

export function StrategyComposer({
  trader,
  onClose,
  onCreated,
}: {
  trader: TopTrader;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useSettings();
  const [draft, setDraft] = useState<CopyTradeDraft>(defaultCopyTradeDraft);
  const [safety, setSafety] = useState(defaultCopyTradePreviewPreferences);
  const [safetyStorageError, setSafetyStorageError] = useState(false);
  const saveSequence = useRef(0);
  useEffect(() => {
    void loadCopyTradePreviewPreferences().then(setSafety);
  }, []);
  const update = <K extends keyof CopyTradeDraft>(
    key: K,
    value: CopyTradeDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const safetyResult = validateCopyTradePreviewPreferences(safety);
  const result = buildPausedCopyTradeInput(
    draft,
    {
      address: trader.address,
      label: `${trader.badge} #${trader.rank}`,
    },
    safetyResult.preview,
  );
  const persistSafety = (next: CopyTradePreviewPreferences) => {
    const sequence = ++saveSequence.current;
    setSafety(next);
    void saveCopyTradePreviewPreferences(next).then(
      () => {
        if (sequence === saveSequence.current) setSafetyStorageError(false);
      },
      () => {
        if (sequence === saveSequence.current) setSafetyStorageError(true);
      },
    );
  };
  const updateSafety = <K extends Exclude<keyof CopyTradePreviewPreferences, "exitLadder">>(
    key: K,
    value: CopyTradePreviewPreferences[K],
  ) => persistSafety({ ...safety, [key]: value });
  const updateLadder = (
    index: 0 | 1,
    key: "triggerPct" | "sellPct",
    value: string,
  ) => {
    const exitLadder = safety.exitLadder.map((level, levelIndex) =>
      levelIndex === index ? { ...level, [key]: value } : level,
    ) as CopyTradePreviewPreferences["exitLadder"];
    persistSafety({ ...safety, exitLadder });
  };
  const mutation = useMutation({
    mutationFn: createPausedCopyTradeConfig,
    onSuccess: onCreated,
  });
  const fields: {
    key: keyof Pick<
      CopyTradeDraft,
      | "maxPositionSizeSol"
      | "maxDailyVolumeSol"
      | "maxDailyLossSol"
      | "stopLossPct"
      | "takeProfitPct"
      | "maxSlippageBps"
      | "maxPriceImpactPct"
      | "minLiquidityUsd"
      | "maxMarketCapUsd"
      | "maxTokenAgeMinutes"
      | "delayMs"
      | "maxConcurrentPositions"
    >;
    label: string;
  }[] = [
    { key: "maxPositionSizeSol", label: t("positionCapSol") },
    { key: "maxDailyVolumeSol", label: t("dailyVolumeSol") },
    { key: "maxDailyLossSol", label: t("dailyLossSol") },
    { key: "stopLossPct", label: t("stopLossPct") },
    { key: "takeProfitPct", label: t("takeProfitPct") },
    { key: "maxSlippageBps", label: t("slippageBps") },
    { key: "maxPriceImpactPct", label: t("priceImpactLimit") },
    { key: "minLiquidityUsd", label: t("copyMinLiquidity") },
    { key: "maxMarketCapUsd", label: t("copyMaxMarketCap") },
    { key: "maxTokenAgeMinutes", label: t("copyMaxAge") },
    { key: "delayMs", label: t("copyDelayMs") },
    { key: "maxConcurrentPositions", label: t("copyMaxConcurrent") },
  ];
  return (
    <View style={styles.composer}>
      <View style={styles.composerHead}>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>{t("reviewStrategy")}</Text>
          <Text style={styles.ruleMeta}>
            {t("savesPaused", { wallet: short(trader.address) })}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("closeStrategyReview")}
          onPress={onClose}
        >
          <Ionicons name="close" size={20} color={colors.muted} />
        </Pressable>
      </View>
      <Text style={styles.inputLabel}>{t("copySizingMode")}</Text>
      <View accessibilityRole="radiogroup" style={styles.modeRow}>
        {(["fixed_sol", "percentage", "proportional"] as CopySizingMode[]).map(
          (mode) => (
            <Pressable
              key={mode}
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.sizingMode === mode }}
              accessibilityLabel={t("selectCopySizing", {
                mode: t(`copySizing_${mode}`),
              })}
              onPress={() => update("sizingMode", mode)}
              style={[
                styles.modePill,
                draft.sizingMode === mode && styles.modePillActive,
              ]}
            >
              <Text
                style={[
                  styles.modePillText,
                  draft.sizingMode === mode && styles.modePillTextActive,
                ]}
              >
                {t(`copySizing_${mode}`)}
              </Text>
            </Pressable>
          ),
        )}
      </View>
      <View style={styles.grid}>
        <Input
          label={
            draft.sizingMode === "fixed_sol"
              ? t("copySizeSol")
              : draft.sizingMode === "percentage"
                ? t("copyPercentage")
                : t("copyRatio")
          }
          value={
            draft[
              draft.sizingMode === "fixed_sol"
                ? "fixedAmountSol"
                : draft.sizingMode === "percentage"
                  ? "percentage"
                  : "proportionalRatio"
            ]
          }
          onChange={(value) =>
            update(
              draft.sizingMode === "fixed_sol"
                ? "fixedAmountSol"
                : draft.sizingMode === "percentage"
                  ? "percentage"
                  : "proportionalRatio",
              value,
            )
          }
        />
        {fields.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            value={draft[field.key]}
            onChange={(value) => update(field.key, value)}
          />
        ))}
      </View>
      <View style={styles.toggleRow}>
        {(["copyBuys", "copySells", "onlyNewLaunches"] as const).map((key) => (
          <Pressable
            key={key}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft[key] }}
            accessibilityLabel={t(`copyToggle_${key}`)}
            onPress={() => update(key, !draft[key])}
            style={[styles.toggle, draft[key] && styles.toggleActive]}
          >
            <Text
              style={[styles.toggleText, draft[key] && styles.toggleTextActive]}
            >
              {t(`copyToggle_${key}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.localPreviewTitle}>{t("copyLocalSafetyPreview")}</Text>
      <Text style={styles.localPreviewHint}>{t("copyLocalPreviewBoundary")}</Text>
      <View style={styles.grid}>
        <Input
          label={t("copyPriorityFeeSol")}
          value={safety.priorityFeeSol}
          onChange={(value) => updateSafety("priorityFeeSol", value)}
        />
        <Input
          label={t("copyMinHolders")}
          value={safety.minHolderCount}
          onChange={(value) => updateSafety("minHolderCount", value)}
        />
        <Input
          label={t("copyTrailingStop")}
          value={safety.trailingStopPct}
          onChange={(value) => updateSafety("trailingStopPct", value)}
        />
      </View>
      <View style={styles.toggleRow}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: safety.antiMev }}
          accessibilityLabel={t("copyAntiMevPreview")}
          onPress={() => updateSafety("antiMev", !safety.antiMev)}
          style={[styles.toggle, safety.antiMev && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, safety.antiMev && styles.toggleTextActive]}>
            {t("copyAntiMevPreview")}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.ladderTitle}>{t("copyExitLadder")}</Text>
      <View style={styles.grid}>
        {safety.exitLadder.flatMap((level, index) => [
          <Input
            key={`trigger-${index}`}
            label={t("copyLadderTrigger", { level: index + 1 })}
            value={level.triggerPct}
            onChange={(value) => updateLadder(index as 0 | 1, "triggerPct", value)}
          />,
          <Input
            key={`sell-${index}`}
            label={t("copyLadderSell", { level: index + 1 })}
            value={level.sellPct}
            onChange={(value) => updateLadder(index as 0 | 1, "sellPct", value)}
          />,
        ])}
      </View>
      <View accessibilityRole="summary" style={styles.preview}>
        <Text style={styles.sectionTitle}>{t("copyPreview")}</Text>
        <Text style={styles.ruleMeta}>
          {t("copyPreviewLimits", {
            cap: draft.maxPositionSizeSol,
            daily: draft.maxDailyVolumeSol,
            slippage: draft.maxSlippageBps,
            impact: draft.maxPriceImpactPct,
          })}
        </Text>
        <Text style={styles.ruleMeta}>
          {t("copyPreviewSafety", {
            fee: safety.priorityFeeSol,
            holders: safety.minHolderCount,
            antiMev: safety.antiMev ? t("copyRequired") : t("copyOff"),
            trailing: safety.trailingStopPct,
            ladder: safety.exitLadder
              .map((level) => `${level.triggerPct}%/${level.sellPct}%`)
              .join(" · "),
          })}
        </Text>
        <Text style={styles.ruleMeta}>
          {t("copyPreviewMarket", {
            liquidity: draft.minLiquidityUsd,
            marketCap: draft.maxMarketCapUsd,
            age: draft.maxTokenAgeMinutes,
            stop: draft.stopLossPct,
            take: draft.takeProfitPct,
          })}
        </Text>
        {result.errors.map((error) => (
          <Text accessibilityRole="alert" key={error} style={styles.error}>
            {t(`copyConfigError_${error}`)}
          </Text>
        ))}
        {safetyResult.errors.map((error) => (
          <Text accessibilityRole="alert" key={error} style={styles.error}>
            {t(`copyPreviewError_${error}`)}
          </Text>
        ))}
      </View>
      <Text style={styles.disclosure}>{t("strategyDisclosure")}</Text>
      <Text style={styles.disclosure}>{t("copyPreviewNotSubmitted")}</Text>
      {safetyStorageError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {t("copyPreviewStorageUnavailable")}
        </Text>
      ) : null}
      {mutation.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {publicErrorMessage(mutation.error, t("actionCouldNotComplete"))}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("savePausedStrategyLabel")}
        accessibilityState={{
          disabled: !result.input || !safetyResult.valid || mutation.isPending,
          busy: mutation.isPending,
        }}
        disabled={!result.input || !safetyResult.valid || mutation.isPending}
        onPress={() => result.input && mutation.mutate(result.input)}
        style={[
          styles.save,
          (!result.input || !safetyResult.valid || mutation.isPending) && styles.disabled,
        ]}
      >
        <Text style={styles.saveText}>
          {mutation.isPending ? t("saving") : t("savePausedStrategy")}
        </Text>
      </Pressable>
    </View>
  );
}

function Strategies({
  data,
  loading,
  error,
  retrying,
  onRetry,
  onChanged,
}: {
  data: CopyTradeConfig[];
  loading: boolean;
  error?: string;
  retrying: boolean;
  onRetry: () => void;
  onChanged: () => void;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingStrategies")} />;
  if (error) return <State error text={error} action={t("retry")} actionBusy={retrying} onAction={onRetry} />;
  return (
    <View>
      <Text style={styles.provenance}>{t("strategyProvenance")}</Text>
      {data.map((config) => (
        <StrategyCard key={config.id} config={config} onChanged={onChanged} />
      ))}
      {!data.length ? <State text={t("noStrategies")} /> : null}
    </View>
  );
}
function StrategyCard({
  config,
  onChanged,
}: {
  config: CopyTradeConfig;
  onChanged: () => void;
}) {
  const { t } = useSettings();
  const pause = useMutation({
    mutationFn: () => pauseCopyTradeConfig(config.id),
    onSuccess: onChanged,
  });
  const remove = useMutation({
    mutationFn: () => deleteCopyTradeConfig(config.id),
    onSuccess: onChanged,
  });
  const label = config.sourceWalletLabel || "strategy";
  const confirmRemove = () =>
    Alert.alert(t("removeStrategyQuestion"), t("removeStrategyDescription"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("remove"),
        style: "destructive",
        onPress: () => remove.mutate(),
      },
    ]);
  return (
    <View style={[styles.card, config.isActive && styles.activeCard]}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: config.isActive ? colors.warning : colors.muted,
            },
          ]}
        />
        <View style={styles.flex}>
          <Text style={styles.wallet}>
            {config.sourceWalletLabel || short(config.sourceWallet)}
          </Text>
          <Text style={styles.badge}>
            {config.isActive ? t("activeOnServer") : t("paused")} ·{" "}
            {t("dbPersisted")}
          </Text>
        </View>
        {config.isActive ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("pauseStrategy", { strategy: label })}
            accessibilityState={{
              disabled: pause.isPending,
              busy: pause.isPending,
            }}
            onPress={() => pause.mutate()}
            disabled={pause.isPending}
            style={styles.pause}
          >
            <Text style={styles.pauseText}>
              {pause.isPending ? t("pausing") : t("pauseNow")}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.metrics}>
        <Metric
          label={t("copySize")}
          value={
            config.sizingMode === "percentage"
              ? `${config.percentage ?? "—"}%`
              : config.sizingMode === "proportional"
                ? `${config.proportionalRatio ?? "—"}×`
                : `${config.fixedAmountSol ?? "—"} SOL`
          }
        />
        <Metric
          label={t("positionCap")}
          value={`${config.maxPositionSizeSol} SOL`}
        />
        <Metric label={t("slippage")} value={`${config.maxSlippageBps} bps`} />
        <Metric label={t("impact")} value={`${config.maxPriceImpactPct}%`} />
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.ruleMeta}>
          {config.copyBuys ? t("buys") : ""}
          {config.copyBuys && config.copySells ? " + " : ""}
          {config.copySells ? t("sells") : ""} ·{" "}
          {t("maxPositions", { count: config.maxConcurrentPositions })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("deleteStrategy", { strategy: label })}
          onPress={confirmRemove}
        >
          <Text style={styles.delete}>{t("delete")}</Text>
        </Pressable>
      </View>
      <Text style={styles.disclosure}>
        {t("savedCopyRules", {
          liquidity: config.minLiquidityUsd,
          marketCap: config.maxMarketCapUsd,
          age: config.maxTokenAgeMinutes,
          stop: config.stopLossPct ?? "—",
          take: config.takeProfitPct ?? "—",
          delay: config.delayMs,
        })}
      </Text>
      {pause.error || remove.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {(pause.error ?? remove.error)?.message}
        </Text>
      ) : null}
    </View>
  );
}

function Activity({
  positions,
  executions,
  loading,
  error,
  retrying,
  onRetry,
}: {
  positions: CopyPosition[];
  executions: CopyExecution[];
  loading: boolean;
  error?: string;
  retrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useSettings();
  if (loading) return <State loading text={t("loadingExecutionAudit")} />;
  if (error) return <State error text={error} action={t("retry")} actionBusy={retrying} onAction={onRetry} />;
  return (
    <View>
      <Text style={styles.provenance}>{t("activityProvenance")}</Text>
      {executions.map((item) => (
        <ExecutionRow key={item.id} execution={item} />
      ))}
      {positions.map((item) => (
        <PositionRow key={item.id} position={item} />
      ))}
      {!positions.length && !executions.length ? (
        <State text={t("noCopyActivity")} />
      ) : null}
    </View>
  );
}
function ExecutionRow({ execution }: { execution: CopyExecution }) {
  const { t } = useSettings();
  const good = execution.status === "confirmed";
  const bad = execution.status === "failed" || execution.status === "expired";
  return (
    <View style={styles.auditRow}>
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: good
              ? colors.positive
              : bad
                ? colors.negative
                : colors.warning,
          },
        ]}
      />
      <View style={styles.flex}>
        <Text style={styles.wallet}>
          {execution.eventType.replaceAll("_", " ")} · {execution.status}
        </Text>
        <Text style={styles.ruleMeta}>
          {execution.executionMode ?? t("modeUnavailable")} · idempotency{" "}
          {short(execution.idempotencyKey)}
        </Text>
        {execution.error ? (
          <Text style={styles.error}>{execution.error}</Text>
        ) : null}
      </View>
      <Text style={styles.auditValue}>
        {execution.confirmedAmountSol ??
          execution.quotedAmountSol ??
          execution.requestedAmountSol ??
          "—"}{" "}
        SOL
      </Text>
    </View>
  );
}
function PositionRow({ position }: { position: CopyPosition }) {
  const { t } = useSettings();
  return (
    <View style={styles.auditRow}>
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor:
              position.status === "open" ? colors.warning : colors.muted,
          },
        ]}
      />
      <View style={styles.flex}>
        <Text style={styles.wallet}>
          {position.tokenSymbol} · {position.status}
        </Text>
        <Text style={styles.ruleMeta}>
          {position.executionMode ?? t("modeUnavailable")} ·{" "}
          {t("entryAmount", { amount: position.entryAmountSol })}
        </Text>
      </View>
      <Text
        style={[
          styles.auditValue,
          {
            color:
              position.unrealizedPnlSol >= 0
                ? colors.positive
                : colors.negative,
          },
        ]}
      >
        {position.unrealizedPnlSol.toFixed(4)} SOL
      </Text>
    </View>
  );
}

function Readiness({ mode, durable }: { mode?: string; durable?: boolean }) {
  const { t } = useSettings();
  return (
    <View accessibilityRole="summary" style={styles.readiness}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: durable ? colors.positive : colors.negative },
        ]}
      />
      <Text style={styles.readinessText}>
        {mode?.replaceAll("-", " ").toUpperCase() ?? t("checking")}
      </Text>
    </View>
  );
}
function IdentityGate({
  locked,
  busy,
  error,
  onUnlock,
  onVerify,
}: {
  locked: boolean;
  busy: boolean;
  error: string | null;
  onUnlock: () => Promise<void>;
  onVerify: () => Promise<void>;
}) {
  const { t } = useSettings();
  const label = locked ? t("unlock") : t("verifyWallet");
  return (
    <View accessibilityRole="summary" style={styles.gate}>
      <Ionicons name="lock-closed" size={26} color={colors.accent} />
      <Text style={styles.sectionTitle}>
        {locked ? t("unlockCopyTrade") : t("verifyWalletOwnership")}
      </Text>
      <Text style={styles.limitation}>{t("privateCopyResources")}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={locked ? onUnlock : onVerify}
        style={styles.save}
      >
        <Text style={styles.saveText}>{busy ? t("working") : label}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={(value) => onChange(boundedCopyNumber(value))}
        keyboardType="decimal-pad"
        style={styles.input}
      />
    </View>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
export function State({
  loading,
  error,
  text,
  compact = false,
  action,
  actionBusy = false,
  onAction,
}: {
  loading?: boolean;
  error?: boolean;
  text: string;
  compact?: boolean;
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
      style={[styles.state, compact && styles.stateCompact]}
    >
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={styles.stateText}>{text}</Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          accessibilityState={{ busy: actionBusy, disabled: actionBusy }}
          disabled={actionBusy}
          onPress={onAction}
          style={[styles.retry, actionBusy && styles.disabled]}
        >
          <Text style={styles.retryText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function short(value: string) {
  return value.length > 13 ? `${value.slice(0, 6)}…${value.slice(-5)}` : value;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 90 },
  header: {
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  flex: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  title: { color: colors.text, fontSize: 25, fontWeight: "900" },
  readiness: {
    maxWidth: 125,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
  },
  readinessText: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: 7,
    fontWeight: "900",
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  safety: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#5a4720",
    backgroundColor: "#241d10",
    borderRadius: 11,
  },
  safetyText: { flex: 1, color: colors.warning, fontSize: 9, lineHeight: 14 },
  tabs: {
    margin: spacing.lg,
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabActive: { backgroundColor: colors.accentDim },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  tabTextActive: { color: colors.accent },
  toolbar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  provenance: {
    color: colors.muted,
    fontSize: 9,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "right",
  },
  limitation: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  periods: {
    flexDirection: "row",
    padding: 3,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  period: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodActive: { backgroundColor: colors.accentDim },
  periodText: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  periodTextActive: { color: colors.accent },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  activeCard: { borderColor: colors.warning },
  cardTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  rankText: { color: colors.accent, fontWeight: "900" },
  wallet: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  badge: { color: colors.muted, fontSize: 8, marginTop: 3 },
  pnl: { textAlign: "right", fontSize: 12, fontWeight: "900" },
  pnlPct: {
    color: colors.muted,
    textAlign: "right",
    fontSize: 9,
    marginTop: 3,
  },
  metrics: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  metricLabel: { color: colors.muted, fontSize: 8 },
  metricValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  review: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: spacing.md,
    padding: 10,
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  reviewText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
  },
  disabled: { opacity: 0.35 },
  composer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  composerHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  ruleMeta: { color: colors.muted, fontSize: 8, marginTop: 3 },
  grid: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modePill: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modePillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modePillText: { color: colors.muted, fontSize: 9, fontWeight: "900" },
  modePillTextActive: { color: colors.background },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  toggle: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  toggleText: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  toggleTextActive: { color: colors.accent },
  preview: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  inputWrap: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 140,
    marginTop: spacing.md,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 7,
    fontWeight: "900",
    marginBottom: 5,
  },
  input: {
    minHeight: 44,
    color: colors.text,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    fontSize: 11,
  },
  disclosure: {
    color: colors.warning,
    fontSize: 9,
    lineHeight: 14,
    marginTop: spacing.lg,
  },
  localPreviewTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  localPreviewHint: {
    color: colors.warning,
    fontSize: 9,
    lineHeight: 14,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  ladderTitle: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "900",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  save: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: 11,
    borderRadius: 9,
    backgroundColor: colors.accent,
    marginTop: spacing.md,
  },
  saveText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  error: { color: colors.negative, fontSize: 9, marginTop: spacing.sm },
  pause: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.warning,
  },
  pauseText: { color: colors.background, fontSize: 8, fontWeight: "900" },
  cardFoot: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
    alignItems: "center",
  },
  delete: { color: colors.negative, fontSize: 9, fontWeight: "800" },
  auditRow: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  auditValue: { color: colors.text, fontSize: 9, fontWeight: "800" },
  gate: {
    margin: spacing.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  state: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  stateCompact: { minHeight: 0, marginHorizontal: spacing.lg, padding: spacing.md },
  stateText: { color: colors.muted, textAlign: "center", lineHeight: 18 },
  retry: {
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  retryText: { color: colors.background, fontSize: 9, fontWeight: "900" },
});
