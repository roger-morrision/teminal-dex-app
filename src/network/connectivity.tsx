import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type ConnectivityStatus = 'checking' | 'online' | 'offline' | 'unknown';
type ConnectivityValue = { status: ConnectivityStatus; recoveredAt: number | null; connectionType: string | null };
const Context = createContext<ConnectivityValue>({ status: 'checking', recoveredAt: null, connectionType: null });

export function classifyNetworkState(state: Network.NetworkState): Exclude<ConnectivityStatus, 'checking'> {
  if (state.isConnected === false || state.isInternetReachable === false || state.type === Network.NetworkStateType.NONE) return 'offline';
  if (state.isConnected === true) return 'online';
  return 'unknown';
}

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ConnectivityValue>({ status: 'checking', recoveredAt: null, connectionType: null });
  const previous = useRef<ConnectivityStatus>('checking');
  useEffect(() => {
    let active = true;
    const apply = (state: Network.NetworkState) => {
      if (!active) return;
      const status = classifyNetworkState(state); const recoveredAt = previous.current === 'offline' && status === 'online' ? Date.now() : null;
      previous.current = status;
      if (status !== 'unknown') onlineManager.setOnline(status === 'online');
      setValue({ status, recoveredAt, connectionType: state.type ?? null });
    };
    void Network.getNetworkStateAsync().then(apply).catch(() => { if (active) setValue({ status: 'unknown', recoveredAt: null, connectionType: null }); });
    const subscription = Network.addNetworkStateListener(apply);
    return () => { active = false; subscription.remove(); };
  }, []);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useConnectivity() { return useContext(Context); }
