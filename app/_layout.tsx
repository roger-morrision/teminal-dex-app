import '@/polyfills';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileWalletProvider } from '@wallet-ui/react-native-kit';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { WalletSessionProvider } from '@/security/WalletSessionProvider';
import { secureWalletCache } from '@/security/wallet-cache';
import { SettingsProvider } from '@/settings/SettingsProvider';
import { ConnectivityProvider } from '@/network/connectivity';
import { ConnectivityBanner } from '@/network/ConnectivityBanner';
import { queryDefaults } from '@/api/query-policy';

const cluster = { id: 'solana:mainnet', url: 'https://api.mainnet-beta.solana.com' } as const;
const identity = { name: 'Terminal DEX' } as const;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: queryDefaults }));
  useEffect(() => {
    if (__DEV__) {
      const commit = Constants.expoConfig?.extra?.mobileBuildCommit;
      console.info(`[MOBILE_BUILD] commit=${typeof commit === 'string' ? commit : 'unverified'}`);
    }
  }, []);
  return <SafeAreaProvider><SettingsProvider><ConnectivityProvider><MobileWalletProvider cluster={cluster} identity={identity} cache={secureWalletCache}><WalletSessionProvider><QueryClientProvider client={queryClient}><StatusBar style="light" /><View style={{ flex: 1, backgroundColor: colors.background }}><ConnectivityBanner /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></View></QueryClientProvider></WalletSessionProvider></MobileWalletProvider></ConnectivityProvider></SettingsProvider></SafeAreaProvider>;
}
