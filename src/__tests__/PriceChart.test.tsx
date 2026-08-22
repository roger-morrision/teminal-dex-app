import { render } from '@testing-library/react-native';
import { downsampleCandles, PriceChart } from '@/components/PriceChart';

describe('PriceChart', () => {
  it('renders validated backend candles with an accessible summary', async () => {
    const screen = await render(<PriceChart data={{ tf: '1h', source: 'database', dataQuality: 'persisted', candles: [{ time: 1, open: 1, high: 2, low: 1, close: 1, volume: 2 }, { time: 2, open: 1, high: 3, low: 1, close: 2, volume: 4 }] }} />);
    expect(screen.getByLabelText('1h token price chart with 2 candles')).toBeTruthy();
    expect(screen.getByText('database · persisted')).toBeTruthy();
  });

  it('bounds chart work while preserving endpoints and a material price spike', async () => {
    const candles = Array.from({ length: 1000 }, (_, time) => ({ time, open: 1, high: time === 500 ? 101 : 2, low: 0, close: time === 500 ? 100 : 1, volume: 1 }));
    const sampled = downsampleCandles(candles);
    expect(sampled).toHaveLength(240);
    expect(sampled[0]).toBe(candles[0]);
    expect(sampled.at(-1)).toBe(candles.at(-1));
    expect(sampled.some((candle) => candle.close === 100)).toBe(true);

    const screen = await render(<PriceChart data={{ tf: '1m', source: 'database', dataQuality: 'persisted', candles }} />);
    expect(screen.getByLabelText('1m token price chart with 1000 candles')).toBeTruthy();
    expect(screen.getByText('240 of 1000 candles rendered')).toBeTruthy();
  });
});
