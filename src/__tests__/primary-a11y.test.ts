import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const primaryScreens = [
  'app/(tabs)/whales.tsx', 'app/(tabs)/discover.tsx', 'app/(tabs)/trenches.tsx', 'app/(tabs)/monitor.tsx',
  'app/(tabs)/portfolio.tsx', 'app/(tabs)/more.tsx', 'app/settings.tsx',
  'app/token/[address].tsx', 'app/trade/[address].tsx',
  'app/copytrade.tsx',
  'app/ai.tsx',
  'app/market-intelligence.tsx',
  'app/wallet-intelligence.tsx',
  'app/research-workspace.tsx',
  'app/operations.tsx',
];

describe('audited-screen accessibility contract', () => {
  it.each(primaryScreens)('%s gives every Pressable an explicit role', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    const unlabeledRoles = [...source.matchAll(/<Pressable\b([^>]*)>/g)].filter((match) => !match[1]?.includes('accessibilityRole'));
    expect(unlabeledRoles).toEqual([]);
  });

  it.each(primaryScreens)('%s gives every text input an accessible label', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    const unlabeledInputs = [...source.matchAll(/<TextInput\b([^>]*)>/g)].filter((match) => !match[1]?.includes('accessibilityLabel'));
    expect(unlabeledInputs).toEqual([]);
  });

  it('keeps Whale Watch scalable and its dense tab rail horizontally recoverable', () => {
    const source = readFileSync(join(process.cwd(), 'app/(tabs)/whales.tsx'), 'utf8');
    expect(source).not.toContain('allowFontScaling={false}');
    expect(source).not.toContain('maxFontSizeMultiplier');
    expect(source).toContain('horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist"');
    expect(source).toContain('useWindowDimensions');
  });
});
