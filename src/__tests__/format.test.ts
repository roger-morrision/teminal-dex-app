import { compactUsd, evidenceLabel, evidenceList, signedPercent, tokenPrice } from '@/lib/format';
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

  it('normalizes optional provider evidence without inventing a value', () => {
    expect(evidenceLabel('  raydium  ', 'unknown')).toBe('raydium');
    expect(evidenceLabel('   ', 'unknown')).toBe('unknown');
    expect(evidenceLabel(undefined, 'unavailable')).toBe('unavailable');
  });

  it('normalizes provider lists and removes blank duplicate evidence', () => {
    expect(evidenceList([' raydium ', '', 'raydium', 'orca'], ' + ', 'none')).toBe('raydium + orca');
    expect(evidenceList([' ', null], ', ', 'none')).toBe('none');
  });
});
