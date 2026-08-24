import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/theme';
import { useSettings } from '@/settings/SettingsProvider';

export default function TabLayout() {
  const { t } = useSettings();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 66, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarIcon: ({ color, size }) => <Ionicons name={({ whales: 'water', discover: 'compass', trenches: 'flash', portfolio: 'wallet', more: 'grid' } as const)[route.name as 'whales'] ?? 'ellipse'} color={color} size={size} /> })}>
    <Tabs.Screen name="whales" options={{ title: t('whales') }} /><Tabs.Screen name="discover" options={{ title: t('discover') }} /><Tabs.Screen name="trenches" options={{ title: t('trenches') }} /><Tabs.Screen name="portfolio" options={{ title: t('portfolio') }} /><Tabs.Screen name="more" options={{ title: t('more') }} /><Tabs.Screen name="monitor" options={{ href: null }} />
  </Tabs>;
}
