import { fireEvent, render } from '@testing-library/react-native';
import { TokenRow } from '@/components/TokenRow';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mint', pairAddress: 'pair', dex: 'raydium', quoteSymbol: 'SOL', price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: '1h', ageMinutes: 60 };

describe('TokenRow', () => {
  it('opens token detail from the accessible row', async () => {
    const onPress = jest.fn();
    const screen = await render(<TokenRow token={token} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Open DEX details'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes idempotent watchlist intent separately', async () => {
    const onPress = jest.fn(); const onToggleWatch = jest.fn();
    const screen = await render(<TokenRow token={token} onPress={onPress} watched onToggleWatch={onToggleWatch} />);
    fireEvent.press(screen.getByLabelText('Remove DEX from watchlist'));
    expect(onToggleWatch).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });
});
