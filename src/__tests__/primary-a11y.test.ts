import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const primaryScreens = [
  'app/(tabs)/discover.tsx', 'app/(tabs)/trenches.tsx', 'app/(tabs)/monitor.tsx',
  'app/(tabs)/portfolio.tsx', 'app/(tabs)/more.tsx', 'app/settings.tsx',
  'app/token/[address].tsx', 'app/trade/[address].tsx',
  'app/copytrade.tsx',
  'app/ai.tsx',
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
});
