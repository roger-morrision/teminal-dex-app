import { fireEvent, render } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenRow } from '@/components/TokenRow';
import { normalizeTokenImageUrl } from '@/components/TokenAvatar';
import { SettingsProvider } from '@/settings/SettingsProvider';

const token = { id: 'pair', symbol: 'DEX', name: 'Terminal', address: 'mint', pairAddress: 'pair', dex: 'raydium', quoteSymbol: 'SOL', price: 1, marketCap: 10, liquidity: 5, volume24h: 4, volume1h: 2, change24h: 3, change1h: 1, txns5m: { buys: 1, sells: 0 }, ageLabel: '1h', ageMinutes: 60 };
const row = (props: ComponentProps<typeof TokenRow>) => <SettingsProvider><TokenRow {...props} /></SettingsProvider>;

describe('TokenRow', () => {
  beforeEach(async () => AsyncStorage.clear());

  it('opens token detail from the accessible row', async () => {
    const onPress = jest.fn();
    const screen = await render(row({ token, onPress }));
    await fireEvent.press(screen.getByLabelText('Open DEX details'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes idempotent watchlist intent separately', async () => {
    const onPress = jest.fn(); const onToggleWatch = jest.fn();
    const screen = await render(row({ token, onPress, watched: true, onToggleWatch }));
    await fireEvent.press(screen.getByLabelText('Remove DEX from watchlist'));
    expect(onToggleWatch).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows holder, volume, social, and launchpad evidence without repeating DEX text', async () => {
    const screen = await render(row({ token: { ...token, dex: 'Pump.fun', holderCount: 1_418, volume24h: 730_426, social: { telegram: 'https://t.me/terminal', website: 'https://terminal.example' } }, onPress: jest.fn(), dense: true }));
    expect(screen.getByText('1.4K holders · $730K vol')).toBeTruthy();
    expect(screen.getByLabelText('Social evidence: Telegram, Website')).toBeTruthy();
    expect(screen.getByLabelText('Pump.fun DEX logo')).toBeTruthy();
    expect(screen.getByLabelText('DEX token logo unavailable; showing initials')).toBeTruthy();
    expect(screen.queryByText(/PUMP\.FUN/i)).toBeNull();
  });

  it('uses the selected period change on the market-cap line', async () => {
    const screen = await render(row({ token: { ...token, change1h: 2, change24h: -8.34 }, period: '24h', onPress: jest.fn(), dense: true }));
    expect(screen.getByText('-8.34%')).toBeTruthy();
    expect(screen.queryByText('+2.00%')).toBeNull();
  });

  it('fails closed for unverified holder and age evidence and keeps exact token identity', async () => {
    const screen = await render(row({ token: { ...token, symbol: '', name: '', ageLabel: 'new', ageMinutes: 0, holderCount: null }, onPress: jest.fn(), dense: true }));
    expect(screen.getByText('mint…mint')).toBeTruthy();
    expect(screen.getByText('holders unavailable · $4 vol')).toBeTruthy();
    expect(screen.getByText('age unavailable')).toBeTruthy();
  });

  it('marks lower-bound holder evidence', async () => {
    const lowerBound = await render(row({ token: { ...token, holderCount: 1_418, holderCountExact: false }, onPress: jest.fn() }));
    expect(lowerBound.getByText('1.4K+ holders · $4 vol')).toBeTruthy();
  });

  it('rejects stale holder evidence', async () => {
    const stale = await render(row({ token: { ...token, holderCount: 1_418, holderCountFreshness: 'stale' }, onPress: jest.fn() }));
    expect(stale.getByText('holders unavailable · $4 vol')).toBeTruthy();
  });

  it('recovers failed provider artwork to the shared accessible identity fallback', async () => {
    const screen = await render(row({ token: { ...token, imageUrl: 'https://cdn.example/token.png' }, onPress: jest.fn() }));
    await fireEvent(screen.getByLabelText('DEX token logo'), 'error');
    expect(screen.getByLabelText('DEX token logo unavailable; showing initials')).toBeTruthy();
  });

  it('requests a native-compatible, bounded Dexscreener logo', () => {
    const url = normalizeTokenImageUrl('https://cdn.dexscreener.com/cms/images/token?width=800&height=800&quality=95&format=auto', 38);
    expect(url).toBe('https://cdn.dexscreener.com/cms/images/token?width=114&height=114&quality=90&format=png');
  });

  it('renders recognizable per-DEX corner branding', async () => {
    const raydium = await render(row({ token: { ...token, dex: 'raydium' }, onPress: jest.fn() }));
    expect(raydium.getByLabelText('Raydium DEX logo')).toBeTruthy();
    expect(raydium.getByText('R')).toBeTruthy();
  });

  it('localizes token evidence and watchlist intents in Vietnamese', async () => {
    await AsyncStorage.setItem('terminal-dex:settings:v1', JSON.stringify({ language: 'vi', reduceMotion: false, diagnosticTelemetry: false }));
    const screen = await render(row({ token: { ...token, ageMinutes: 0, ageLabel: 'new', holderCount: null, social: { telegram: 'https://t.me/terminal' } }, onPress: jest.fn(), onToggleWatch: jest.fn() }));
    expect(await screen.findByLabelText('Mở chi tiết DEX')).toBeTruthy();
    expect(screen.getByLabelText('Thêm DEX vào danh sách theo dõi')).toBeTruthy();
    expect(screen.getByText('không có tuổi token')).toBeTruthy();
    expect(screen.getByText('không có dữ liệu người nắm giữ · KL $4')).toBeTruthy();
    expect(screen.getByLabelText('Bằng chứng xã hội: Telegram')).toBeTruthy();
    expect(screen.getByLabelText('Không có logo token DEX; đang hiển thị ký tự viết tắt')).toBeTruthy();
    expect(screen.getByLabelText('Logo DEX Raydium')).toBeTruthy();
    expect(screen.getByText('Vốn hóa $10')).toBeTruthy();
    expect(screen.getByLabelText('Giá $1, vốn hóa $10, thay đổi 1h: +1.00%')).toBeTruthy();
  });

  it('announces missing selected-period change without inventing a percentage', async () => {
    const screen = await render(row({ token: { ...token, change6h: undefined }, period: '6h', onPress: jest.fn() }));
    expect(screen.getByLabelText('Price $1, market cap $10, 6h change: unavailable')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
  });
});
