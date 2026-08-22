import '@/polyfills';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileWalletProvider } from '@wallet-ui/react-native-kit';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { WalletSessionProvider } from '@/security/WalletSessionProvider';
import { secureWalletCache } from '@/security/wallet-cache';

const cluster = { id: 'solana:mainnet', url: 'https://api.mainnet-beta.solana.com' } as const;
const identity = { name: 'Terminal DEX' } as const;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 15_000, gcTime: 5 * 60_000 } } }));
  return <SafeAreaProvider><MobileWalletProvider cluster={cluster} identity={identity} cache={secureWalletCache}><WalletSessionProvider><QueryClientProvider client={queryClient}><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></QueryClientProvider></WalletSessionProvider></MobileWalletProvider></SafeAreaProvider>;
}
