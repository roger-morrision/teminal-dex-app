import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWalletSession } from "@/security/WalletSessionProvider";
import { clearLocalAppData } from "@/settings/privacy";
import { useSettings, type Language } from "@/settings/SettingsProvider";
import { colors, spacing } from "@/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const wallet = useWalletSession();
  const settings = useSettings();
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [clearStatus, setClearStatus] = useState("");
  const clear = async () => {
    setClearing(true);
    setClearError("");
    setClearStatus("");
    try {
      await wallet.disconnect();
      await clearLocalAppData();
      await settings.resetPreferences();
      queryClient.clear();
      setClearStatus(settings.t("clearComplete"));
    } catch {
      setClearError(settings.t("clearFailed"));
    } finally {
      setClearing(false);
    }
  };
  const confirmClear = () =>
    Alert.alert(settings.t("clearQuestion"), settings.t("clearDescription"), [
      { text: settings.t("cancel"), style: "cancel" },
      {
        text: settings.t("clearLocalData"),
        style: "destructive",
        onPress: () => void clear(),
      },
    ]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={settings.t("backSettings")}
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>{settings.t("deviceControls")}</Text>
            <Text style={styles.title}>{settings.t("settings")}</Text>
          </View>
        </View>
        <Section
          title={settings.t("language")}
          description={settings.t("languageDescription")}
        >
          <View accessibilityRole="radiogroup" style={styles.segment}>
            {(["en", "vi"] as Language[]).map((value) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={value === "en" ? "English" : "Tiếng Việt"}
                accessibilityState={{ checked: settings.language === value }}
                key={value}
                onPress={() => settings.setLanguage(value)}
                style={[
                  styles.segmentItem,
                  settings.language === value && styles.active,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.language === value && styles.activeText,
                  ]}
                >
                  {value === "en" ? "English" : "Tiếng Việt"}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
        <Section
          title={settings.t("accessibility")}
          description={settings.t("accessibilityDescription")}
        >
          <SettingRow
            label={settings.t("reduceMotion")}
            detail={settings.t("reduceMotionDetail")}
            value={settings.reduceMotion}
            onChange={settings.setReduceMotion}
          />
        </Section>
        <Section
          title={settings.t("privacySecurity")}
          description={settings.t("telemetryDescription")}
        >
          <SettingRow
            label={settings.t("diagnosticTelemetry")}
            detail={settings.t("noTelemetry")}
            value={settings.diagnosticTelemetry}
            onChange={settings.setDiagnosticTelemetry}
          />
          <Evidence icon="lock-closed" text={settings.t("transportSecurity")} />
          <Evidence icon="link" text={settings.t("deepLinkSecurity")} />
          <Evidence icon="finger-print" text={settings.t("walletSecurity")} />
        </Section>
        <Section
          title={settings.t("dataControls")}
          description={settings.t("dataControlsDescription")}
        >
          <ResetControl
            clearing={clearing}
            error={clearError}
            status={clearStatus}
            label={settings.t("disconnectClear")}
            clearingLabel={settings.t("clearing")}
            onPress={confirmClear}
          />
        </Section>
        <Text style={styles.footer}>{settings.t("footerSecurity")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
export function ResetControl({
  clearing,
  error,
  status,
  label,
  clearingLabel,
  onPress,
}: {
  clearing: boolean;
  error: string;
  status: string;
  label: string;
  clearingLabel: string;
  onPress: () => void;
}) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: clearing, busy: clearing }}
        disabled={clearing}
        onPress={onPress}
        style={styles.destructive}
      >
        <Ionicons name="trash" size={15} color={colors.negative} />
        <Text style={styles.destructiveText}>
          {clearing ? clearingLabel : label}
        </Text>
      </Pressable>
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.resetError}
        >
          {error}
        </Text>
      ) : status ? (
        <Text
          accessibilityRole="summary"
          accessibilityLiveRegion="polite"
          style={styles.resetStatus}
        >
          {status}
        </Text>
      ) : null}
    </>
  );
}
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}
function SettingRow({
  label,
  detail,
  value,
  onChange,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => Promise<void>;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={(next) => void onChange(next)}
        trackColor={{ false: colors.border, true: colors.accentDim }}
        thumbColor={value ? colors.accent : colors.muted}
      />
    </View>
  );
}
function Evidence({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.evidence}>
      <Ionicons name={icon} size={15} color={colors.accent} />
      <Text style={styles.evidenceText}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 70 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
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
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  title: { color: colors.text, fontSize: 25, fontWeight: "900" },
  section: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  description: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
    marginBottom: spacing.md,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  segmentItem: { flex: 1, minHeight: 44, justifyContent: "center", alignItems: "center", padding: 9, borderRadius: 8 },
  active: { backgroundColor: colors.accent },
  segmentText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  activeText: { color: colors.background },
  row: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  flex: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: 11, fontWeight: "800" },
  rowDetail: { color: colors.muted, fontSize: 8, lineHeight: 13, marginTop: 3 },
  evidence: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  evidenceText: { flex: 1, color: colors.muted, fontSize: 9, lineHeight: 14 },
  destructive: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: "#5a2630",
    borderRadius: 10,
    backgroundColor: "#211217",
  },
  destructiveText: { color: colors.negative, fontSize: 10, fontWeight: "900" },
  resetError: {
    color: colors.negative,
    fontSize: 9,
    lineHeight: 14,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  resetStatus: {
    color: colors.positive,
    fontSize: 9,
    lineHeight: 14,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  footer: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 8,
    marginTop: spacing.lg,
  },
});
