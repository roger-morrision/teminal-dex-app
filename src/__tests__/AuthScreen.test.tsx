import { act, fireEvent, render } from '@testing-library/react-native';
import AuthScreen from '../../app/auth';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: jest.fn() }),
}));

jest.mock('@/settings/SettingsProvider', () => ({
  useSettings: () => ({ t: (key: string) => key }),
}));

jest.mock('@/auth/PrivyAuthProvider', () => ({
  usePrivyIdentity: () => ({
    configured: true,
    ready: false,
    authenticated: false,
    busy: true,
    userLabel: null,
    error: null,
    supportsEmailOtp: false,
    sendEmailCode: async () => false,
    verifyEmailCode: async () => false,
    loginWithGoogle: async () => false,
    openLogin: jest.fn(),
    logout: async () => undefined,
  }),
}));

describe('Privy initialization recovery', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockBack.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('replaces the indefinite spinner with an accessible bounded recovery action', async () => {
    const view = await render(<AuthScreen />);
    expect(view.getByLabelText('loading')).toBeTruthy();

    await act(() => jest.advanceTimersByTime(12_000));

    expect(view.queryByLabelText('loading')).toBeNull();
    expect(view.getByText('privyInitializationTimeout')).toBeTruthy();
    fireEvent.press(view.getByRole('button', { name: 'privyReturnToApp' }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
