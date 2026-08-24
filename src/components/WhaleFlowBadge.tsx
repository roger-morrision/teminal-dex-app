import { StyleSheet, Text, View } from "react-native";
import type { WhaleFlow } from "@/lib/whale-activity";
import { compactUsd } from "@/lib/format";
import { useSettings } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

export function WhaleFlowBadge({ flow }: { flow?: WhaleFlow }) {
  const { t } = useSettings();
  if (!flow) return null;
  const positive = flow.netUsd >= 0;
  return (
    <View accessible accessibilityRole="summary" style={styles.wrap}>
      <Text style={[styles.label, { color: positive ? colors.positive : colors.negative }]}>
        {t(positive ? "whalesAccumulating" : "whalesDistributing")}
      </Text>
      <Text style={styles.value}>{positive ? "+" : ""}{compactUsd(flow.netUsd)}</Text>
      <Text style={styles.meta}>{t("whaleFlowSummaryWithCoverage", { buys: flow.buys, sells: flow.sells, wallets: flow.uniqueWallets, coverage: Math.round(flow.amountCoverage * 100) })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.lg, marginTop: -6, marginBottom: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.accentDim, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: 8, fontWeight: "900", textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 9, fontWeight: "900" },
  meta: { flex: 1, color: colors.muted, fontSize: 7, textAlign: "right" },
});
