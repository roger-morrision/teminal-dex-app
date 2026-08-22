import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSolanaAddress } from '@/security/input';

export type TrackedWallet = { address: string; label: string };
export const TRACKED_WALLETS_KEY = 'terminal-dex:tracked-wallets:v1';
export const MAX_TRACKED_WALLETS = 50;

function normalize(value: unknown): TrackedWallet | null { if (!value || typeof value !== 'object') return null; const item = value as Record<string, unknown>; const address = typeof item.address === 'string' ? item.address.trim() : ''; if (!isSolanaAddress(address)) return null; const raw = typeof item.label === 'string' ? item.label.trim() : ''; const label = raw.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 40) || `Wallet ${address.slice(0, 5)}`; return { address, label }; }
export async function loadTrackedWallets(): Promise<TrackedWallet[]> { try { const raw = await AsyncStorage.getItem(TRACKED_WALLETS_KEY); const parsed = raw ? JSON.parse(raw) : []; if (!Array.isArray(parsed)) return []; return [...new Map(parsed.map(normalize).filter((item): item is TrackedWallet => Boolean(item)).map((item) => [item.address, item])).values()].slice(0, MAX_TRACKED_WALLETS); } catch { return []; } }
async function persist(items: TrackedWallet[]) { await AsyncStorage.setItem(TRACKED_WALLETS_KEY, JSON.stringify(items)); }
export async function addTrackedWallet(current: TrackedWallet[], address: string, label: string): Promise<TrackedWallet[]> { const item = normalize({ address, label }); if (!item) throw new Error('Enter a valid 32-byte Solana public address.'); const next = [item, ...current.filter((wallet) => wallet.address !== item.address)].slice(0, MAX_TRACKED_WALLETS); await persist(next); return next; }
export async function removeTrackedWallet(current: TrackedWallet[], address: string): Promise<TrackedWallet[]> { const next = current.filter((wallet) => wallet.address !== address); await persist(next); return next; }
