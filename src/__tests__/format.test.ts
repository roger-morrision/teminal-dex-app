import { compactUsd, signedPercent, tokenPrice } from '@/lib/format';
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
});
