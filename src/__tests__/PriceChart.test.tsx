import { render } from '@testing-library/react-native';
import { PriceChart } from '@/components/PriceChart';

describe('PriceChart', () => {
  it('renders validated backend candles with an accessible summary', async () => {
    const screen = await render(<PriceChart data={{ tf: '1h', source: 'database', dataQuality: 'persisted', candles: [{ time: 1, open: 1, high: 2, low: 1, close: 1, volume: 2 }, { time: 2, open: 1, high: 3, low: 1, close: 2, volume: 4 }] }} />);
    expect(screen.getByLabelText('1h token price chart with 2 candles')).toBeTruthy();
    expect(screen.getByText('database · persisted')).toBeTruthy();
  });
});
