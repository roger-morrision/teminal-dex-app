import AsyncStorage from '@react-native-async-storage/async-storage';
import { addTrackedWallet, loadTrackedWallets, MAX_TRACKED_WALLETS, removeTrackedWallet, TRACKED_WALLETS_KEY } from '@/store/tracked-wallets';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() } }));
const address = '11111111111111111111111111111111';

describe('tracked wallet persistence', () => {
  beforeEach(() => jest.clearAllMocks());
  it('sanitizes labels, deduplicates exact addresses, and persists a bounded list', async () => { jest.mocked(AsyncStorage.setItem).mockResolvedValue(); const next = await addTrackedWallet([{ address, label: 'Old' }], address, '  Whale\u0000 desk  '); expect(next).toEqual([{ address, label: 'Whale desk' }]); expect(AsyncStorage.setItem).toHaveBeenCalledWith(TRACKED_WALLETS_KEY, JSON.stringify(next)); expect(MAX_TRACKED_WALLETS).toBe(50); });
  it('drops malformed stored entries and supports explicit removal', async () => { jest.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ address, label: 'Valid' }, { address: 'bad', label: 'Bad' }])); jest.mocked(AsyncStorage.setItem).mockResolvedValue(); const loaded = await loadTrackedWallets(); expect(loaded).toHaveLength(1); expect(await removeTrackedWallet(loaded, address)).toEqual([]); });
  it('rejects noncanonical public keys before storage', async () => { await expect(addTrackedWallet([], '111111111111111111111111111111111', 'Bad')).rejects.toThrow('valid 32-byte'); expect(AsyncStorage.setItem).not.toHaveBeenCalled(); });
});
