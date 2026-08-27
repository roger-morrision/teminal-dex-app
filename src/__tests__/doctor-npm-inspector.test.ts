import { spawnSync } from 'node:child_process';
import path from 'node:path';

const inspector = path.join(
  process.cwd(),
  'scripts',
  'doctor-npm-inspector.mjs',
);

function run(...args: string[]) {
  return spawnSync(process.execPath, [inspector, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('Expo Doctor npm inspector', () => {
  it('provides only the npm 8+ read-only compatibility surface', () => {
    const result = run('--version');
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toMatch(/^10\.\d+\.\d+$/u);
  });

  it.each([
    '@unimodules/core',
    'expo-cli',
    '@react-native-vector-icons/common',
  ])('truthfully reports absent incompatible package %s from the lockfile', (name) => {
    const result = run('explain', name, '--json');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`No dependencies found matching ${name}`);
  });

  it('fails closed for unsupported package-manager operations', () => {
    const result = run('install');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('supports only --version and read-only explain');
  });
});
