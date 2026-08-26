import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

const brands = [
  { matches: ["pump.fun", "pumpfun", "pumpswap", "pump"], name: "Pump.fun", mark: "P", background: "#55e78b", foreground: "#07120b" },
  { matches: ["raydium"], name: "Raydium", mark: "R", background: "#6c5ce7", foreground: "#ffffff" },
  { matches: ["meteora"], name: "Meteora", mark: "M", background: "#f59e0b", foreground: "#161006" },
  { matches: ["orca"], name: "Orca", mark: "O", background: "#2eb8e6", foreground: "#06141a" },
  { matches: ["jupiter"], name: "Jupiter", mark: "J", background: "#c7f284", foreground: "#10160a" },
] as const;

export function getDexBrand(dex?: string | null) {
  const normalized = dex?.trim().toLowerCase() ?? "";
  return brands.find((brand) => brand.matches.some((value) => normalized.includes(value))) ?? null;
}

export function DexLogo({ dex, size = 18, accessible = true, accessibilityLabel }: { dex?: string | null; size?: number; accessible?: boolean; accessibilityLabel?: string }) {
  const brand = getDexBrand(dex);
  const label = brand?.name ?? (dex?.trim() || "Unknown DEX");
  return <View accessible={accessible} accessibilityLabel={accessible ? accessibilityLabel ?? `${label} DEX logo` : undefined} style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: brand?.background ?? colors.surfaceRaised }]}>
    {brand ? <Text style={{ color: brand.foreground, fontSize: Math.max(7, size * 0.43), fontWeight: "900" }}>{brand.mark}</Text> : <Ionicons name="swap-horizontal" size={Math.max(8, size * 0.55)} color={colors.cyan} />}
  </View>;
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.background },
});
