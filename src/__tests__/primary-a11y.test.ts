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
    expect(source).toContain('fontScale >= 1.5');
    expect(source).toContain('largeText && { alignItems: "flex-start" }');
    expect(source).toContain('largeText && { minWidth: 0 }');
    expect(source).toContain('t("openWhaleRelationship"');
    expect(source).not.toContain('feed.error.message');
    expect(source).not.toContain('rankings.error?.message');
  });

  it.each(['app/(tabs)/discover.tsx', 'app/(tabs)/trenches.tsx', 'app/(tabs)/portfolio.tsx'])('%s does not render raw query errors', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    expect(source).not.toContain('.error.message');
    expect(source).toContain('t("evidenceLoadFailed")');
  });

  it('keeps Monitor read failures private while preserving mutation feedback', () => {
    const source = readFileSync(join(process.cwd(), 'app/(tabs)/monitor.tsx'), 'utf8');
    expect(source).not.toContain('query.error.message');
    expect(source).toContain('t("evidenceLoadFailed")');
    expect(source).toContain('publicErrorMessage(mutation.error');
  });

  it.each([
    'app/ai.tsx',
    'app/market-intelligence.tsx',
    'app/wallet-intelligence.tsx',
    'app/research-workspace.tsx',
    'app/operations.tsx',
    'app/track.tsx',
  ])('%s keeps auxiliary read failures private', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    expect(source).not.toMatch(/(?:query|feed|social|history|deliveries|rankings|holdings|pnl|token|chart|market|gainers|fresh|traders|connections|diagnostics)\.error\??\.message/);
  });

  it('keeps CopyTrade read failures private while preserving mutation feedback', () => {
    const source = readFileSync(join(process.cwd(), 'app/copytrade.tsx'), 'utf8');
    expect(source).not.toMatch(/(?:health|rankings|configs|positions|executions)\.error\??\.message/);
    expect(source).toContain('publicErrorMessage(mutation.error');
    expect(source).toContain('t("evidenceLoadFailed")');
  });

  it.each(primaryScreens)('%s never renders exception messages verbatim', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    expect(source).not.toMatch(/\.error\??\.message/);
  });

  it.each(['app/ai.tsx', 'app/copytrade.tsx', 'app/(tabs)/monitor.tsx', 'app/(tabs)/portfolio.tsx'])(
    '%s never renders wallet adapter errors verbatim',
    (file) => {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      expect(source).not.toContain('error={wallet.error}');
      expect(source).not.toMatch(/>\s*\{wallet\.error\}\s*</);
      expect(source).toContain('t("actionCouldNotComplete")');
    },
  );

  it('keeps table and CopyTrade audit provider failures private', () => {
    const table = readFileSync(join(process.cwd(), 'src/components/MonitorTokenTable.tsx'), 'utf8');
    const copyTrade = readFileSync(join(process.cwd(), 'app/copytrade.tsx'), 'utf8');
    expect(table).not.toContain('query.error.message');
    expect(copyTrade).not.toContain('{execution.error}');
  });

  it('sanitizes wallet adapter exceptions at the session boundary', () => {
    const source = readFileSync(join(process.cwd(), 'src/security/WalletSessionProvider.tsx'), 'utf8');
    expect(source).not.toContain('cause.message');
    expect(source).toContain("setError('Wallet verification failed.')");
  });

  it('classifies provider evidence before rendering diagnostic reasons', () => {
    const files = [
      'app/track.tsx',
      'app/(tabs)/monitor.tsx',
      'app/trade/[address].tsx',
      'app/operations.tsx',
    ];
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      expect(source).toContain('publicReasonKey');
    }
    expect(readFileSync(join(process.cwd(), 'app/track.tsx'), 'utf8')).not.toContain('{item.reason}');
    expect(readFileSync(join(process.cwd(), 'app/operations.tsx'), 'utf8')).not.toContain('error: item.runtime.lastError');
    expect(readFileSync(join(process.cwd(), 'app/trade/[address].tsx'), 'utf8')).not.toContain('error: prepare.data.simulation.simulation.error');
  });

  it('keeps loaded Discover rows visible and exposes explicit recovery after a page failure', () => {
    const source = readFileSync(join(process.cwd(), 'app/(tabs)/discover.tsx'), 'utf8');
    expect(source).toContain('feed.isFetchNextPageError && rows.length');
    expect(source).toContain('!feed.isFetchNextPageError');
    expect(source).toContain('onPress={() => void feed.fetchNextPage()}');
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).not.toContain('feed.error.message');
  });
});
