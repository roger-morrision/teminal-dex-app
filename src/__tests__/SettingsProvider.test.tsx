import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { SettingsProvider, useSettings } from '@/settings/SettingsProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() } }));

function Consumer() {
  const settings = useSettings();
  return <><Text>{settings.t('noLaunches', { lane: settings.t('new').toLowerCase() })}</Text><Text>{settings.t('quoteCheckExactIn', { slippage: '1.00' })}</Text><Text>{settings.t('tradingLocked')}</Text><Text>{settings.t('maxPositions', { count: 2 })}</Text><Text>{settings.t('copyTradeSafety')}</Text><Text>{settings.t('governanceProgress', { trades: 12, days: 3 })}</Text><Text>{settings.t('aiSafety')}</Text><Text>{settings.t('heatmapInclusion', { source: 'rpc', included: 8, excluded: 2 })}</Text><Text>{settings.t('marketIntelSafety')}</Text><Text>{settings.t('rankingEvidence', { source: 'rpc', quality: 'verified', freshness: settings.t('current') })}</Text><Text>{settings.t('walletIntelSafety')}</Text><Pressable accessibilityRole="button" accessibilityLabel="Vietnamese" onPress={() => settings.setLanguage('vi')}><Text>{settings.t('discover')}</Text></Pressable></>;
}

describe('SettingsProvider localization', () => {
  beforeEach(() => { jest.clearAllMocks(); jest.mocked(AsyncStorage.getItem).mockResolvedValue(null); jest.mocked(AsyncStorage.setItem).mockResolvedValue(); });

  it('switches full-screen strings immediately and interpolates bounded values', async () => {
    const screen = await render(<SettingsProvider><Consumer /></SettingsProvider>);
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    expect(screen.getByText('Discover')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Vietnamese'));
    await waitFor(() => expect(screen.getByText('Khám phá')).toBeTruthy());
    expect(screen.getByText('Không có token mới đã xác minh.')).toBeTruthy();
    expect(screen.getByText('Báo giá ExactIn với trượt giá 1.00%')).toBeTruthy();
    expect(screen.getByText(/Giao dịch bị khóa/)).toBeTruthy();
    expect(screen.getByText('tối đa 2 vị thế')).toBeTruthy();
    expect(screen.getByText(/Di động tạo chiến lược ở trạng thái tạm dừng/)).toBeTruthy();
    expect(screen.getByText('12/500 giao dịch đã đóng · 3/60 ngày vận hành')).toBeTruthy();
    expect(screen.getByText(/Mọi khuyến nghị chỉ mang tính tham khảo/)).toBeTruthy();
    expect(screen.getByText('rpc · gồm 8 · loại 2')).toBeTruthy();
    expect(screen.getByText(/Quan sát có chữ ký và ảnh chụp thị trường/)).toBeTruthy();
    expect(screen.getByText('rpc · verified · HIỆN TẠI · xếp hạng là dữ liệu lịch sử')).toBeTruthy();
    expect(screen.getByText(/Tài sản ví công khai và PnL đã thực hiện/)).toBeTruthy();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('terminal-dex:settings:v1', expect.stringContaining('"language":"vi"'));
  });

  it('fails malformed stored preferences back to safe English defaults', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue('{bad json');
    const screen = await render(<SettingsProvider><Consumer /></SettingsProvider>);
    await waitFor(() => expect(screen.getByText('Discover')).toBeTruthy());
    expect(screen.queryByText('Khám phá')).toBeNull();
  });
});
