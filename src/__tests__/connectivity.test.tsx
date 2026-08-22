import { onlineManager } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ApiError } from '@/api/client';
import { queryDefaults, shouldRetryQuery } from '@/api/query-policy';
import { classifyNetworkState, ConnectivityProvider, useConnectivity } from '@/network/connectivity';

let mockListener: ((state: { type?: string; isConnected?: boolean; isInternetReachable?: boolean }) => void) | undefined;
const mockRemove = jest.fn();
jest.mock('expo-network', () => ({
  NetworkStateType: { NONE: 'NONE', UNKNOWN: 'UNKNOWN', WIFI: 'WIFI' },
  getNetworkStateAsync: jest.fn().mockResolvedValue({ type: 'NONE', isConnected: false, isInternetReachable: false }),
  addNetworkStateListener: jest.fn((next) => { mockListener = next; return { remove: mockRemove }; }),
}));

function Consumer() { const state = useConnectivity(); return <Text>{state.status}:{state.recoveredAt == null ? 'none' : 'recovered'}</Text>; }

describe('offline and recovery policy', () => {
  afterEach(() => { onlineManager.setOnline(true); });

  it('classifies explicit unreachable state without guessing unknown state offline', () => {
    expect(classifyNetworkState({ type: 'NONE' as never, isConnected: false, isInternetReachable: false })).toBe('offline');
    expect(classifyNetworkState({ type: 'UNKNOWN' as never })).toBe('unknown');
    expect(classifyNetworkState({ type: 'WIFI' as never, isConnected: true, isInternetReachable: true })).toBe('online');
  });

  it('pauses queries offline and marks a later online event as recovered', async () => {
    const screen = await render(<ConnectivityProvider><Consumer /></ConnectivityProvider>);
    await waitFor(() => expect(screen.getByText('offline:none')).toBeTruthy());
    expect(onlineManager.isOnline()).toBe(false);
    await act(async () => mockListener?.({ type: 'WIFI', isConnected: true, isInternetReachable: true }));
    await waitFor(() => expect(screen.getByText('online:recovered')).toBeTruthy());
    expect(onlineManager.isOnline()).toBe(true);
    await act(async () => screen.unmount()); expect(mockRemove).toHaveBeenCalled();
  });

  it('retries transient reads only, while mutations never retry or queue on reconnect', () => {
    expect(shouldRetryQuery(0, new ApiError('bad request', 400))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError('server', 503))).toBe(true);
    expect(shouldRetryQuery(2, new Error('network'))).toBe(false);
    expect(shouldRetryQuery(0, Object.assign(new Error('cancelled'), { name: 'AbortError' }))).toBe(false);
    expect(queryDefaults.queries.networkMode).toBe('online');
    expect(queryDefaults.queries.refetchOnReconnect).toBe('always');
    expect(queryDefaults.mutations).toEqual({ retry: false, networkMode: 'always' });
  });
});
