import { fireEvent, render } from '@testing-library/react-native';
import { TrenchCard } from '../../app/(tabs)/trenches';
import { SettingsProvider } from '@/settings/SettingsProvider';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mintaddress', pairAddress: 'pair', dex: 'pumpfun', quoteSymbol: 'SOL', price: 1, marketCap: 60_000, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 4, sells: 2 }, ageLabel: '1m', ageMinutes: 1, bondingProgress: 87 };

describe('TrenchCard', () => {
  it('keeps detail and quote-review intents distinct', async () => { const onDetail = jest.fn(); const onTrade = jest.fn(); const screen = await render(<SettingsProvider><TrenchCard token={token} lane="almostBonded" onDetail={onDetail} onTrade={onTrade} /></SettingsProvider>); await fireEvent.press(screen.getByLabelText('Review DEX quote')); expect(onTrade).toHaveBeenCalledTimes(1); expect(onDetail).not.toHaveBeenCalled(); await fireEvent.press(screen.getByLabelText('Open DEX launch details')); expect(onDetail).toHaveBeenCalledTimes(1); });
});
