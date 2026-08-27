import { compactUsd, evidenceLabel, evidenceList, localizedNumber, localizedRelativeObservedAge, observedDateTime, relativeObservedAge, signedPercent, tokenPrice } from '@/lib/format';
describe('formatters', () => {
  it('formats market values defensively', () => {
    expect(compactUsd(null)).toBe('—');
    expect(signedPercent(-2.5)).toBe('-2.50%');
    expect(tokenPrice(0.000001)).toBe('$0.000001');
  });

  it('compacts large USD values deterministically without Intl compact support', () => {
    expect(compactUsd(999.99)).toBe('$999.99');
    expect(compactUsd(2_600)).toBe('$2.6K');
    expect(compactUsd(433_565_871.94)).toBe('$434M');
    expect(compactUsd(-12_632_757_110.95)).toBe('-$12.6B');
    expect(compactUsd(1_052_693_990.66)).toBe('$1.05B');
  });

  it('formats counts with the selected locale and fails closed', () => {
    expect(localizedNumber(1234.5, 'en')).toBe('1,234.5');
    expect(localizedNumber(1234.5, 'vi')).toBe('1.234,5');
    expect(localizedNumber(Number.NaN, 'en', 'Unavailable')).toBe('Unavailable');
  });

  it('normalizes optional provider evidence without inventing a value', () => {
    expect(evidenceLabel('  raydium  ', 'unknown')).toBe('raydium');
    expect(evidenceLabel('   ', 'unknown')).toBe('unknown');
    expect(evidenceLabel(undefined, 'unavailable')).toBe('unavailable');
  });

  it('normalizes provider lists and removes blank duplicate evidence', () => {
    expect(evidenceList([' raydium ', '', 'raydium', 'orca'], ' + ', 'none')).toBe('raydium + orca');
    expect(evidenceList([' ', null], ', ', 'none')).toBe('none');
  });

  it('formats observed seconds or milliseconds with the selected locale and rejects invalid evidence', () => {
    expect(observedDateTime(1_700_000_000, 'en', 'Unavailable')).toContain('2023');
    expect(observedDateTime(1_700_000_000_000, 'vi', 'Không có')).toContain('2023');
    expect(observedDateTime(Number.NaN, 'en', 'Unavailable')).toBe('Unavailable');
    expect(observedDateTime('2023-11-14T22:13:20.000Z', 'en', 'Unavailable')).toContain('2023');
    expect(observedDateTime('not-a-date', 'en', 'Unavailable')).toBe('Unavailable');
  });

  it('classifies relative observation age and rejects invalid or future timestamps', () => {
    const now = 1_700_000_000_000;
    expect(relativeObservedAge((now - 30_000) / 1000, now)).toEqual({ key: 'secondsAgo', count: 30 });
    expect(relativeObservedAge(now - 120_000, now)).toEqual({ key: 'minutesAgo', count: 2 });
    expect(relativeObservedAge(now - 10_800_000, now)).toEqual({ key: 'hoursAgo', count: 3 });
    expect(relativeObservedAge(now - 172_800_000, now)).toEqual({ key: 'daysAgo', count: 2 });
    expect(relativeObservedAge(Number.NaN, now)).toBeNull();
    expect(relativeObservedAge(now + 1, now)).toBeNull();
  });

  it('localizes shared relative age and fails closed through the caller fallback', () => {
    const now = 1_700_000_000_000;
    const translate = (key: string, values: { count: number }) => `${key}:${values.count}`;
    expect(localizedRelativeObservedAge(now - 172_800_000, translate, 'Unavailable', now)).toBe('daysAgo:2');
    expect(localizedRelativeObservedAge(now + 1, translate, 'Unavailable', now)).toBe('Unavailable');
  });
});
