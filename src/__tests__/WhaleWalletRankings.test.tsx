import { fireEvent, render } from '@testing-library/react-native';
import { WalletRankings } from '../../app/(tabs)/whales';
import { SettingsProvider } from '@/settings/SettingsProvider';

const rows = [{ rank: 1, address: '11111111111111111111111111111111', pnlUsd: 500, pnlPct: 10, winRate: 60, trades: 8, tokenCount: 3, maxDrawdownPct: 12, reliability: 80, bestToken: 'SOL', bestTokenPct: 20, badge: 'Whale', sparkline: [1, 2] }];

describe('WalletRankings', () => {
  it('shows the held-token avatar and labeled total PnL without changing inspection behavior', async () => {
    const onOpen = jest.fn();
    const screen = await render(<SettingsProvider><WalletRankings rows={rows} hasEvidence loading={false} refreshing={false} error={false} onRetry={jest.fn()} onOpenAll={jest.fn()} onOpen={onOpen} /></SettingsProvider>);

    expect(screen.getByText('SO')).toBeTruthy();
    expect(screen.getByText('best observed token')).toBeTruthy();
    expect(screen.getByText('SOL')).toBeTruthy();
    expect(screen.getByText('Total PnL')).toBeTruthy();
    expect(screen.getByText('+$500')).toBeTruthy();
    expect(screen.getByText('+10.00%')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(/Total PnL: \+\$500/));
    expect(onOpen).toHaveBeenCalledWith(rows[0]!.address);
  });
});
