import { fireEvent, render } from '@testing-library/react-native';
import { TrackedWalletRow } from '../../app/wallet-intelligence';
import { SettingsProvider } from '@/settings/SettingsProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined) } }));

describe('TrackedWalletRow', () => {
  it('keeps inspect and destructive remove intents distinct', async () => { const onOpen = jest.fn(); const onRemove = jest.fn(); const item = { address: '11111111111111111111111111111111', label: 'Research wallet' }; const screen = await render(<SettingsProvider><TrackedWalletRow item={item} active={false} onOpen={onOpen} onRemove={onRemove} /></SettingsProvider>); await fireEvent.press(screen.getByLabelText('Inspect tracked wallet Research wallet')); expect(onOpen).toHaveBeenCalledTimes(1); expect(onRemove).not.toHaveBeenCalled(); await fireEvent.press(screen.getByLabelText('Remove tracked wallet Research wallet')); expect(onRemove).toHaveBeenCalledTimes(1); });
});
