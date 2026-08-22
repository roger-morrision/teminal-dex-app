import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/theme';

export default function TabLayout() {
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 66, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarIcon: ({ color, size }) => <Ionicons name={({ discover: 'compass', trenches: 'flash', monitor: 'pulse', portfolio: 'wallet', more: 'grid' } as const)[route.name as 'discover'] ?? 'ellipse'} color={color} size={size} /> })}>
    <Tabs.Screen name="discover" options={{ title: 'Discover' }} /><Tabs.Screen name="trenches" options={{ title: 'Trenches' }} /><Tabs.Screen name="monitor" options={{ title: 'Monitor' }} /><Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} /><Tabs.Screen name="more" options={{ title: 'More' }} />
  </Tabs>;
}
