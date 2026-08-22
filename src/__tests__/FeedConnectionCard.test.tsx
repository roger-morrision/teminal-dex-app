import { render } from '@testing-library/react-native';
import { FeedConnectionCard } from '../../app/operations';
import { SettingsProvider } from '@/settings/SettingsProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined) } }));

describe('FeedConnectionCard', () => {
  it('labels configuration separately from observed delivery and persistence', async () => {
    const screen = await render(<SettingsProvider><FeedConnectionCard item={{
      id: 'provider', label: 'Provider', method: 'api', status: 'available', health: 'degraded', receiving: false,
      deliveryStatus: 'stale_persisted', configured: true,
      records: { pairs: 2, transactions: 3, candles: 4, total: 9, lastPersistedAt: Date.now() - 130_000, persistenceAgeMs: 130_000, freshness: 'stale' },
    }} /></SettingsProvider>);
    expect(screen.getByLabelText('Provider, degraded, 9 persisted records')).toBeTruthy();
    expect(screen.getByText(/stale persisted · configured/i)).toBeTruthy();
    expect(screen.getByText(/stale · 2m ago/i)).toBeTruthy();
  });
});
