import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { colors } from '@/theme';
import { useSettings } from '@/settings/SettingsProvider';
import { useIsHydrated } from '@/lib/use-hydrated-window-dimensions';

export default function TabLayout() {
  const { t } = useSettings();
  const hydrated = useIsHydrated();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarActiveBackgroundColor: colors.accentDim, tabBarStyle: { backgroundColor: colors.surfaceRaised, borderTopColor: colors.border, height: 72, paddingTop: 6, paddingBottom: 6 }, tabBarItemStyle: { marginHorizontal: 3, borderRadius: 12 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '800' }, tabBarIcon: ({ color, size }) => <Ionicons name={({ whales: 'water', discover: 'compass', trenches: 'flash', portfolio: 'wallet', more: 'grid' } as const)[route.name as 'whales'] ?? 'ellipse'} color={color} size={size} /> })}>
    <Tabs.Screen name="whales" options={{ title: t('whales') }} /><Tabs.Screen name="discover" options={{ title: t('discover') }} /><Tabs.Screen name="trenches" options={{ title: t('trenches') }} /><Tabs.Screen name="portfolio" options={{ title: t('portfolio') }} /><Tabs.Screen name="more" options={{ title: t('more') }} /><Tabs.Screen name="monitor" options={{ href: null }} />
  </Tabs>;
}
