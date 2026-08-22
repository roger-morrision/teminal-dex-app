import { fireEvent, render } from '@testing-library/react-native';
import { TraderCard } from '../../app/copytrade';
import { SettingsProvider } from '@/settings/SettingsProvider';

const trader = { rank: 1, address: '11111111111111111111111111111111', pnlUsd: 500, pnlPct: 10, winRate: 60, trades: 8, tokenCount: 3, maxDrawdownPct: 12, reliability: 80, bestToken: 'SOL', bestTokenPct: 20, badge: 'Smart Money', sparkline: [1, 2] };
jest.mock('@/security/WalletSessionProvider', () => ({ useWalletSession: jest.fn() }));

describe('TraderCard', () => {
  it('requires verified durable configuration before review', async () => { const onSelect = jest.fn(); const screen = await render(<SettingsProvider><TraderCard trader={trader} canConfigure={false} onSelect={onSelect} /></SettingsProvider>); await fireEvent.press(screen.getByLabelText('Review copying 111111…11111')); expect(onSelect).not.toHaveBeenCalled(); expect(screen.getByText('Verify wallet + durable storage required')).toBeTruthy(); });
  it('opens only a paused strategy review when eligible', async () => { const onSelect = jest.fn(); const screen = await render(<SettingsProvider><TraderCard trader={trader} canConfigure onSelect={onSelect} /></SettingsProvider>); await fireEvent.press(screen.getByLabelText('Review copying 111111…11111')); expect(onSelect).toHaveBeenCalledTimes(1); expect(screen.getByText('Review paused strategy')).toBeTruthy(); });
});
