import { fireEvent, render } from '@testing-library/react-native';
import { TokenRow } from '@/components/TokenRow';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mint', pairAddress: 'pair', dex: 'raydium', quoteSymbol: 'SOL', price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: '1h', ageMinutes: 60 };

describe('TokenRow', () => {
  it('opens token detail from the accessible row', async () => {
    const onPress = jest.fn();
    const screen = await render(<TokenRow token={token} onPress={onPress} />);
    await fireEvent.press(screen.getByLabelText('Open DEX details'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes idempotent watchlist intent separately', async () => {
    const onPress = jest.fn(); const onToggleWatch = jest.fn();
    const screen = await render(<TokenRow token={token} onPress={onPress} watched onToggleWatch={onToggleWatch} />);
    await fireEvent.press(screen.getByLabelText('Remove DEX from watchlist'));
    expect(onToggleWatch).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows holder, volume, social, and launchpad evidence without repeating DEX text', async () => {
    const screen = await render(<TokenRow token={{ ...token, dex: 'Pump.fun', holderCount: 1_418, volume24h: 730_426, social: { telegram: 'https://t.me/terminal', website: 'https://terminal.example' } }} onPress={jest.fn()} dense />);
    expect(screen.getByText('1.4K holders · $730K vol')).toBeTruthy();
    expect(screen.getByLabelText('Social evidence: Telegram, Website')).toBeTruthy();
    expect(screen.getByLabelText('Pump.fun launchpad')).toBeTruthy();
    expect(screen.getByLabelText('DEX token logo unavailable; showing initials')).toBeTruthy();
    expect(screen.queryByText(/PUMP\.FUN/i)).toBeNull();
  });

  it('uses the selected period change on the market-cap line', async () => {
    const screen = await render(<TokenRow token={{ ...token, change1h: 2, change24h: -8.34 }} period="24h" onPress={jest.fn()} dense />);
    expect(screen.getByText('-8.34%')).toBeTruthy();
    expect(screen.queryByText('+2.00%')).toBeNull();
  });

  it('fails closed for unverified holder and age evidence and keeps exact token identity', async () => {
    const screen = await render(<TokenRow token={{ ...token, symbol: '', name: '', ageLabel: 'new', ageMinutes: 0, holderCount: null }} onPress={jest.fn()} dense />);
    expect(screen.getByText('mint…mint')).toBeTruthy();
    expect(screen.getByText('— holders · $4 vol')).toBeTruthy();
    expect(screen.queryByText('new')).toBeNull();
  });

  it('marks lower-bound holder evidence', async () => {
    const lowerBound = await render(<TokenRow token={{ ...token, holderCount: 1_418, holderCountExact: false }} onPress={jest.fn()} />);
    expect(lowerBound.getByText('1.4K+ holders · $4 vol')).toBeTruthy();
  });

  it('rejects stale holder evidence', async () => {
    const stale = await render(<TokenRow token={{ ...token, holderCount: 1_418, holderCountFreshness: 'stale' }} onPress={jest.fn()} />);
    expect(stale.getByText('— holders · $4 vol')).toBeTruthy();
  });

  it('recovers failed provider artwork to the shared accessible identity fallback', async () => {
    const screen = await render(<TokenRow token={{ ...token, imageUrl: 'https://cdn.example/token.png' }} onPress={jest.fn()} />);
    await fireEvent(screen.getByLabelText('DEX token logo'), 'error');
    expect(screen.getByLabelText('DEX token logo unavailable; showing initials')).toBeTruthy();
  });
});
