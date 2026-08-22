import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'vi';
type Settings = { language: Language; reduceMotion: boolean; diagnosticTelemetry: boolean };
type SettingsContext = Settings & { ready: boolean; setLanguage: (value: Language) => Promise<void>; setReduceMotion: (value: boolean) => Promise<void>; setDiagnosticTelemetry: (value: boolean) => Promise<void>; resetPreferences: () => Promise<void>; t: (key: TranslationKey) => string };
const KEY = 'terminal-dex:settings:v1';
const defaults: Settings = { language: 'en', reduceMotion: false, diagnosticTelemetry: false };
const translations = {
  en: { discover: 'Discover', trenches: 'Trenches', monitor: 'Monitor', portfolio: 'Portfolio', more: 'More', moreTools: 'More tools', settings: 'Settings', privacySecurity: 'Privacy & security' },
  vi: { discover: 'Khám phá', trenches: 'Token mới', monitor: 'Theo dõi', portfolio: 'Danh mục', more: 'Thêm', moreTools: 'Công cụ khác', settings: 'Cài đặt', privacySecurity: 'Quyền riêng tư & bảo mật' },
} as const;
type TranslationKey = keyof typeof translations.en;
const Context = createContext<SettingsContext | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults); const [ready, setReady] = useState(false);
  useEffect(() => { void AsyncStorage.getItem(KEY).then((raw) => { try { const value = JSON.parse(raw ?? '{}') as Partial<Settings>; setSettings({ language: value.language === 'vi' ? 'vi' : 'en', reduceMotion: value.reduceMotion === true, diagnosticTelemetry: value.diagnosticTelemetry === true }); } catch { setSettings(defaults); } }).finally(() => setReady(true)); }, []);
  const update = useCallback(async (next: Settings) => { setSettings(next); await AsyncStorage.setItem(KEY, JSON.stringify(next)); }, []);
  const value = useMemo<SettingsContext>(() => ({ ...settings, ready, setLanguage: async (language) => update({ ...settings, language }), setReduceMotion: async (reduceMotion) => update({ ...settings, reduceMotion }), setDiagnosticTelemetry: async (diagnosticTelemetry) => update({ ...settings, diagnosticTelemetry }), resetPreferences: async () => { await AsyncStorage.removeItem(KEY); setSettings(defaults); }, t: (key) => translations[settings.language][key] }), [settings, ready, update]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSettings() { const value = useContext(Context); if (!value) throw new Error('useSettings must be inside SettingsProvider'); return value; }
export const SETTINGS_STORAGE_KEY = KEY;
