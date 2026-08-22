import { fireEvent, render } from '@testing-library/react-native';
import { SignalCard } from '../../app/market-intelligence';
import { SettingsProvider } from '@/settings/SettingsProvider';

const base = { id: 'sig', type: 'On-chain Buy' as const, token: 'SOL', description: 'Signature-backed buy', time: 'now', amountUsd: 25, txHash: 'signature', source: 'rpc' };

describe('SignalCard', () => {
  it('opens only an exactly valid Solana mint', async () => { const onToken = jest.fn(); const valid = '11111111111111111111111111111111'; const screen = await render(<SettingsProvider><SignalCard item={{ ...base, tokenAddress: valid }} onToken={onToken} /></SettingsProvider>); await fireEvent.press(screen.getByLabelText('Open SOL signal token')); expect(onToken).toHaveBeenCalledWith(valid); });
  it('does not expose navigation for a malformed provider mint', async () => { const onToken = jest.fn(); const screen = await render(<SettingsProvider><SignalCard item={{ ...base, tokenAddress: 'not-a-mint' }} onToken={onToken} /></SettingsProvider>); expect(screen.queryByLabelText('Open SOL signal token')).toBeNull(); expect(onToken).not.toHaveBeenCalled(); });
});
