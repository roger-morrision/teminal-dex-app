import { compactUsd, signedPercent, tokenPrice } from '@/lib/format';
describe('formatters', () => { it('formats market values defensively', () => { expect(compactUsd(null)).toBe('—'); expect(signedPercent(-2.5)).toBe('-2.50%'); expect(tokenPrice(0.000001)).toBe('$0.000001'); }); });
