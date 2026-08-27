import packageJson from '../../package.json';
import fs from 'node:fs';
import path from 'node:path';

const qualityScriptExecutables = {
  typecheck: { command: 'tsc', packageName: 'typescript' },
  lint: { command: 'eslint', packageName: 'eslint' },
  'diagnostics:expo': { command: 'expo', packageName: 'expo' },
  'diagnostics:doctor': { command: 'node', packageName: 'expo-doctor' },
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

  it('runs Expo Doctor through the child-Node PATH recovery wrapper', () => {
    expect(packageJson.scripts['diagnostics:doctor']).toBe(
      'node scripts/run-expo-doctor.mjs',
    );
  });

  it('keeps the Doctor npm fallback read-only and lockfile-backed', () => {
    const inspector = fs.readFileSync(
      path.join(process.cwd(), 'scripts/doctor-npm-inspector.mjs'),
      'utf8',
    );
    expect(inspector).toContain("readFileSync(join(process.cwd(), 'package-lock.json')");
    expect(inspector).toContain("args[0] === 'explain'");
    expect(inspector).not.toContain('npm install');
  });
});
