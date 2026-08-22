import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SnipeCard } from '../../app/research-workspace';
import { SettingsProvider } from '@/settings/SettingsProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('@/api/client', () => ({ fetchTokenDetail: jest.fn().mockResolvedValue({ token: null }), fetchOhlcv: jest.fn() }));
const entry = { address: '11111111111111111111111111111111', notes: '', above: null, below: null, addedAt: 1 };
function Wrapper({ children }: { children: ReactNode }) { return <SettingsProvider><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })}>{children}</QueryClientProvider></SettingsProvider>; }

describe('SnipeCard', () => {
  it('keeps research detail and destructive removal distinct', async () => { const onOpen = jest.fn(); const onRemove = jest.fn(); const screen = await render(<SnipeCard entry={entry} onUpdate={jest.fn()} onOpen={onOpen} onRemove={onRemove} />, { wrapper: Wrapper }); await fireEvent.press(screen.getByLabelText('Open candidate token research')); expect(onOpen).toHaveBeenCalledTimes(1); expect(onRemove).not.toHaveBeenCalled(); await fireEvent.press(screen.getByLabelText('Remove Snipe List candidate')); expect(onRemove).toHaveBeenCalledTimes(1); });
  it('stores a positive visual threshold without claiming an alert', async () => { const onUpdate = jest.fn(); const screen = await render(<SnipeCard entry={entry} onUpdate={onUpdate} onOpen={jest.fn()} onRemove={jest.fn()} />, { wrapper: Wrapper }); const input = screen.getByLabelText('Visual price above threshold'); await fireEvent.changeText(input, '2.5'); await fireEvent(input, 'endEditing', { nativeEvent: { text: '2.5' } }); expect(onUpdate).toHaveBeenCalledWith({ above: 2.5 }); });
});
