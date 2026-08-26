import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

export function TokenAvatar({ symbol, identity, imageUrl, size = 38, accessible = true }: { symbol: string; identity: string; imageUrl?: string | null; size?: number; accessible?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const shape = { width: size, height: size, borderRadius: size / 2 } as const;
  const displayUrl = normalizeTokenImageUrl(imageUrl, size);
  if (displayUrl && displayUrl !== failedUrl) return <Image accessible={accessible} accessibilityLabel={accessible ? `${symbol} token logo` : undefined} source={{ uri: displayUrl }} onError={() => setFailedUrl(displayUrl)} resizeMode="cover" style={[styles.image, shape]} />;
  return <View accessible={accessible} accessibilityLabel={accessible ? `${symbol} token logo unavailable; showing initials` : undefined} style={[styles.fallback, shape, { backgroundColor: fallbackColor(identity) }]}><Text style={[styles.initials, { fontSize: Math.max(7, size * 0.25) }]}>{symbol.slice(0, 2).toUpperCase()}</Text></View>;
}

export function normalizeTokenImageUrl(imageUrl: string | null | undefined, size: number) {
  if (!imageUrl) return null;
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== "https:") return null;
    if (url.hostname === "cdn.dexscreener.com" && url.pathname.startsWith("/cms/images/")) {
      const pixels = String(Math.max(64, Math.min(256, Math.ceil(size * 3))));
      url.searchParams.set("width", pixels);
      url.searchParams.set("height", pixels);
      url.searchParams.set("quality", "90");
      url.searchParams.set("format", "png");
    }
    return url.toString();
  } catch {
    return null;
  }
}

function fallbackColor(identity: string) {
  const palette = ["#134e4a", "#164e63", "#312e81", "#4c1d95", "#7f1d1d", "#713f12"];
  const hash = Array.from(identity).reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  return palette[hash % palette.length];
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceRaised },
  fallback: { alignItems: "center", justifyContent: "center" },
  initials: { color: colors.accent, fontWeight: "900" },
});
