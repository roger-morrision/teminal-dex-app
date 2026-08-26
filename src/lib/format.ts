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
  value: number,
  language: 'en' | 'vi',
  fallback: string,
): string {
  const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
  if (!Number.isFinite(milliseconds)) return fallback;
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) return fallback;
  return date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
}
