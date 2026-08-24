import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

export function TokenAvatar({ symbol, identity, imageUrl, size = 38, accessible = true }: { symbol: string; identity: string; imageUrl?: string | null; size?: number; accessible?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const shape = { width: size, height: size, borderRadius: size / 2 } as const;
  if (imageUrl && imageUrl !== failedUrl) return <Image accessible={accessible} accessibilityLabel={accessible ? `${symbol} token logo` : undefined} source={{ uri: imageUrl }} onError={() => setFailedUrl(imageUrl)} style={[styles.image, shape]} />;
  return <View accessible={accessible} accessibilityLabel={accessible ? `${symbol} token logo unavailable; showing initials` : undefined} style={[styles.fallback, shape, { backgroundColor: fallbackColor(identity) }]}><Text style={[styles.initials, { fontSize: Math.max(7, size * 0.25) }]}>{symbol.slice(0, 2).toUpperCase()}</Text></View>;
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
