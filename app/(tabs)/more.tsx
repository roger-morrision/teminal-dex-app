import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";
import { useSettings } from "@/settings/SettingsProvider";
const groups = [
  { id: "ai", key: "aiIntelligence", pathname: "/ai" },
  { id: "track", key: "track", pathname: "/track" },
  { id: "copytrade", key: "copyTrade", pathname: "/copytrade" },
  { id: "top-traders", key: "topTraders", pathname: "/copytrade" },
  {
    id: "smart-money",
    key: "smartMoney",
    pathname: "/wallet-intelligence",
    tab: "smart",
  },
  {
    id: "wallet-tracker",
    key: "walletTracker",
    pathname: "/wallet-intelligence",
    tab: "tracker",
  },
  {
    id: "signals",
    key: "signals",
    pathname: "/market-intelligence",
    tab: "signals",
  },
  {
    id: "heatmap",
    key: "heatmap",
    pathname: "/market-intelligence",
    tab: "heatmap",
  },
  {
    id: "snipe",
    key: "snipeList",
    pathname: "/research-workspace",
    tab: "snipe",
  },
  {
    id: "analytics",
    key: "analytics",
    pathname: "/operations",
    tab: "analytics",
  },
  {
    id: "multicharts",
    key: "multicharts",
    pathname: "/research-workspace",
    tab: "charts",
  },
  { id: "feed", key: "feedData", pathname: "/operations", tab: "feed" },
  {
    id: "claims",
    key: "claimMonitor",
    pathname: "/market-intelligence",
    tab: "claims",
  },
] as const;
export default function MoreScreen() {
  const router = useRouter();
  const { t } = useSettings();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TERMINAL DEX</Text>
        <Text style={styles.title}>{t("moreTools")}</Text>
        <Text style={styles.note}>{t("routesNote")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("openSettings")}
          onPress={() => router.push("/settings")}
          style={styles.settings}
        >
          <Text style={styles.label}>{t("settings")}</Text>
          <Text style={[styles.status, styles.live]}>
            {t("privacyAccessibilityLanguages")}
          </Text>
        </Pressable>
        <Text style={styles.section}>{t("intelligenceAutomation")}</Text>
        <Text style={styles.warning}>{t("automationWarning")}</Text>
        {groups.map((item) => {
          const live = "pathname" in item;
          const label = t(item.key);
          const status = live ? t("available") : t("queued");
          const open = () => {
            if (!live) return;
            if ("tab" in item)
              router.push({
                pathname: item.pathname,
                params: { tab: item.tab },
              });
            else router.push(item.pathname);
          };
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("openToolStatus", { tool: label, status })}
              accessibilityState={{ disabled: !live }}
              key={item.id}
              disabled={!live}
              onPress={open}
              style={[styles.row, !live && styles.disabled]}
            >
              <Text style={styles.label}>{label}</Text>
              <Text style={[styles.status, live && styles.live]}>
                {live ? t("open") : t("queued").toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 90 },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 4 },
  note: { color: colors.muted, lineHeight: 20, marginVertical: spacing.lg },
  settings: {
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    backgroundColor: colors.accentDim,
  },
  section: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: spacing.md,
  },
  warning: {
    color: colors.warning,
    fontSize: 9,
    lineHeight: 14,
    marginVertical: spacing.md,
  },
  row: {
    minHeight: 54,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  disabled: { opacity: 0.58 },
  label: { color: colors.text, fontWeight: "700" },
  status: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  live: { color: colors.accent },
});
