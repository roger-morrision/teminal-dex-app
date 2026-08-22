import {
  ActivityIndicator,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { colors } from "@/theme";

export function BusyIndicator({
  label,
  style,
  color = colors.accent,
  size,
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
  color?: string;
  size?: "small" | "large";
}) {
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: true }}
      style={style}
    >
      <ActivityIndicator color={color} size={size} />
    </View>
  );
}
