import AsyncStorage from '@react-native-async-storage/async-storage';
import { addSnipeEntry, boundedResearchNumber, loadResearchWorkspace, MAX_SNIPE_ENTRIES, RESEARCH_STORAGE_KEY, saveResearchWorkspace, setChartSlot, updateSnipeEntry } from '@/store/research';

jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() } }));
const address = '11111111111111111111111111111111';
const second = 'So11111111111111111111111111111111111111112';

describe('research workspace persistence', () => {
  beforeEach(() => jest.clearAllMocks());
  it('drops malformed entries, sanitizes notes and bounds thresholds', async () => { jest.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ snipe: [{ address, notes: '  note\u0000 ', above: 2, below: -1 }, { address: 'bad' }], charts: [address, address, 'bad'], timeframe: 'invalid' })); const result = await loadResearchWorkspace(); expect(result).toEqual({ snipe: [{ address, notes: 'note', above: 2, below: null, addedAt: 0 }], charts: [address], timeframe: '15m' }); });
  it('adds exact mints, updates bounded research fields, and maintains unique chart slots', () => { let workspace = addSnipeEntry({ snipe: [], charts: [], timeframe: '15m' }, address); workspace = updateSnipeEntry(workspace, address, { notes: 'x'.repeat(200), above: Number.POSITIVE_INFINITY, below: 1 }); workspace = setChartSlot(workspace, 0, address); workspace = setChartSlot(workspace, 1, second); expect(workspace.snipe[0]).toEqual(expect.objectContaining({ notes: 'x'.repeat(120), above: null, below: 1 })); expect(workspace.charts).toEqual([address, second]); expect(MAX_SNIPE_ENTRIES).toBe(20); });
  it('persists only normalized exact-address data', async () => { jest.mocked(AsyncStorage.setItem).mockResolvedValue(); await saveResearchWorkspace({ snipe: [{ address, notes: 'ok', above: null, below: null, addedAt: 1 }], charts: [address, 'bad'], timeframe: '1h' }); expect(AsyncStorage.setItem).toHaveBeenCalledWith(RESEARCH_STORAGE_KEY, JSON.stringify({ snipe: [{ address, notes: 'ok', above: null, below: null, addedAt: 1 }], charts: [address], timeframe: '1h' })); });
  it('rejects malformed mints before they enter the workspace', () => { expect(() => addSnipeEntry({ snipe: [], charts: [], timeframe: '15m' }, '111111111111111111111111111111111')).toThrow('exact 32-byte'); });
  it('normalizes research thresholds before persistence', () => { expect(boundedResearchNumber('12.3x4.567890.1')).toBe('12.345678'); expect(boundedResearchNumber('123456789012345')).toBe('123456789012'); });
});
