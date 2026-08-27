export function compactUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const absolute = Math.abs(value);
  const units = [
    { threshold: 1_000_000_000_000_000, suffix: 'Q' },
    { threshold: 1_000_000_000_000, suffix: 'T' },
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
  ] as const;
  const unit = units.find(({ threshold }) => absolute >= threshold);
  if (!unit) {
    return `${value < 0 ? '-' : ''}$${absolute.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
  const scaled = absolute / unit.threshold;
  const fractionDigits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return `${value < 0 ? '-' : ''}$${scaled.toLocaleString('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  })}${unit.suffix}`;
}

export function tokenPrice(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const digits = value < 0.001 ? 8 : value < 1 ? 6 : 2;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: digits })}`;
}

export function signedPercent(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function evidenceLabel(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function evidenceList(
  values: unknown,
  separator: string,
  fallback: string,
): string {
  if (!Array.isArray(values)) return fallback;
  const normalized = values
    .flatMap((value) =>
      typeof value === 'string' && value.trim() ? [value.trim()] : [],
    )
    .filter((value, index, all) => all.indexOf(value) === index);
  return normalized.length ? normalized.join(separator) : fallback;
}

export function observedDateTime(
  value: number | string,
  language: 'en' | 'vi',
  fallback: string,
): string {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  const milliseconds = typeof value === 'string' && !Number.isFinite(numericValue)
    ? Date.parse(value)
    : numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue;
  if (!Number.isFinite(milliseconds)) return fallback;
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) return fallback;
  return date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
}

export function relativeObservedAge(
  value: number,
  now = Date.now(),
): { key: 'secondsAgo' | 'minutesAgo' | 'hoursAgo' | 'daysAgo'; count: number } | null {
  const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
  if (!Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds > now) return null;
  const seconds = Math.floor((now - milliseconds) / 1000);
  if (seconds < 60) return { key: 'secondsAgo', count: seconds };
  if (seconds < 3600) return { key: 'minutesAgo', count: Math.floor(seconds / 60) };
  if (seconds < 86400) return { key: 'hoursAgo', count: Math.floor(seconds / 3600) };
  return { key: 'daysAgo', count: Math.floor(seconds / 86400) };
}

export function localizedRelativeObservedAge(
  value: number,
  translate: (key: 'secondsAgo' | 'minutesAgo' | 'hoursAgo' | 'daysAgo', values: { count: number }) => string,
  fallback: string,
  now = Date.now(),
): string {
  const age = relativeObservedAge(value, now);
  return age ? translate(age.key, { count: age.count }) : fallback;
}
