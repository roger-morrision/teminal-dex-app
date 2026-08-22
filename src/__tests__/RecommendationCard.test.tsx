import { fireEvent, render } from '@testing-library/react-native';
import { RecommendationCard } from '../../app/ai';
import { SettingsProvider } from '@/settings/SettingsProvider';
jest.mock('@/security/WalletSessionProvider', () => ({ useWalletSession: jest.fn() }));

const base = { tokenAddress: '11111111111111111111111111111111', tokenSymbol: 'SOL', chain: 'solana', score: 80, confidence: 70, category: 'monitor', modelVersion: 'v1', createdAt: '2026-08-22T00:00:00.000Z', recommendationEvidence: { status: 'advisory_current' as const, safeForAdvisoryUse: true, executionEnabled: false as const, providerFamilies: ['rpc', 'dex'], missingFeatures: [], expired: false, costsIncluded: true, pointInTime: true }, outcomes: { total: 1, resolved: 1, wins: 1, losses: 0, avgReturnPct: 2 } };
describe('RecommendationCard', () => {
  it('opens evidence without presenting an execution action', async () => { const onOpen = jest.fn(); const screen = await render(<SettingsProvider><RecommendationCard recommendation={base} onOpen={onOpen} /></SettingsProvider>); await fireEvent.press(screen.getByLabelText('Open SOL advisory evidence')); expect(onOpen).toHaveBeenCalledTimes(1); expect(screen.queryByText(/buy|execute|approve/i)).toBeNull(); });
  it('keeps expired recommendations visibly unqualified', async () => { const recommendation = { ...base, recommendationEvidence: { ...base.recommendationEvidence, status: 'expired' as const, safeForAdvisoryUse: false, expired: true } }; const screen = await render(<SettingsProvider><RecommendationCard recommendation={recommendation} onOpen={jest.fn()} /></SettingsProvider>); expect(screen.getByText('Not qualified for advisory use: expired.')).toBeTruthy(); });
});
