import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { SettingsProvider, useSettings } from '@/settings/SettingsProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() } }));

function Consumer() {
  const settings = useSettings();
  return <><Text>{settings.t('noLaunches', { lane: settings.t('new').toLowerCase() })}</Text><Pressable accessibilityRole="button" accessibilityLabel="Vietnamese" onPress={() => settings.setLanguage('vi')}><Text>{settings.t('discover')}</Text></Pressable></>;
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
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('terminal-dex:settings:v1', expect.stringContaining('"language":"vi"'));
  });

  it('fails malformed stored preferences back to safe English defaults', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue('{bad json');
    const screen = await render(<SettingsProvider><Consumer /></SettingsProvider>);
    await waitFor(() => expect(screen.getByText('Discover')).toBeTruthy());
    expect(screen.queryByText('Khám phá')).toBeNull();
  });
});
