import packageJson from '../../package.json';

const qualityScriptExecutables = {
  typecheck: { command: 'tsc', packageName: 'typescript' },
  lint: { command: 'eslint', packageName: 'eslint' },
  'diagnostics:expo': { command: 'expo', packageName: 'expo' },
  'diagnostics:doctor': { command: 'expo-doctor', packageName: 'expo-doctor' },
  test: { command: 'jest', packageName: 'jest' },
  'test:ci': { command: 'jest', packageName: 'jest' },
} as const;

describe('package quality scripts', () => {
  it.each(Object.entries(qualityScriptExecutables))(
    '%s resolves through a declared local executable',
    (scriptName, expected) => {
      const script = packageJson.scripts[scriptName as keyof typeof packageJson.scripts];
      const firstCommand = script.trim().split(/\s+/u)[0];
      const declaredPackages = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      expect(firstCommand).toBe(expected.command);
      expect(firstCommand).not.toBe('npx');
      expect(declaredPackages).toHaveProperty(expected.packageName);
    },
  );

  it('keeps lint scoped to source-owned roots', () => {
    expect(packageJson.scripts.lint).toBe('eslint app src');
  });
});
