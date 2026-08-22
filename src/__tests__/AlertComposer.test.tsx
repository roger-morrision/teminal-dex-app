import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import { AlertComposer } from '../../app/(tabs)/monitor';
jest.mock('@/security/WalletSessionProvider', () => ({ useWalletSession: jest.fn() }));

describe('AlertComposer', () => {
  it('keeps persistence disabled until all financial inputs are valid', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const screen = await render(<QueryClientProvider client={client}><AlertComposer onCreated={jest.fn()} /></QueryClientProvider>);
    const save = screen.getByLabelText('Save alert rule');
    expect(save.props.accessibilityState?.disabled).toBe(true);
    await fireEvent.changeText(screen.getByLabelText('Alert name'), 'SOL breakout');
    await fireEvent.changeText(screen.getByLabelText('Alert token address'), '11111111111111111111111111111111');
    await fireEvent.changeText(screen.getByLabelText('Alert threshold'), '0');
    expect(save.props.accessibilityState?.disabled).toBe(true);
    await fireEvent.changeText(screen.getByLabelText('Alert threshold'), '10.5');
    expect(screen.getByLabelText('Save alert rule').props.accessibilityState?.disabled).toBe(false);
  });
});
