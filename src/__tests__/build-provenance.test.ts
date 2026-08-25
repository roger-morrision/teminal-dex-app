import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');
const launcher = fs.readFileSync(
  path.join(projectRoot, 'scripts/start-verified.mjs'),
  'utf8',
);
const rootLayout = fs.readFileSync(path.join(projectRoot, 'app/_layout.tsx'), 'utf8');

function loadConfig(commit?: string) {
  const previous = process.env.MOBILE_BUILD_COMMIT;
  if (commit === undefined) delete process.env.MOBILE_BUILD_COMMIT;
  else process.env.MOBILE_BUILD_COMMIT = commit;
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config = require('../../app.config');
  if (previous === undefined) delete process.env.MOBILE_BUILD_COMMIT;
  else process.env.MOBILE_BUILD_COMMIT = previous;
  return config;
}

describe('verified development build provenance', () => {
  it('embeds the exact supplied public commit in Expo config', () => {
    expect(loadConfig('0123456789abcdef').extra.mobileBuildCommit).toBe(
      '0123456789abcdef',
    );
  });

  it('marks ordinary development bundles as unverified', () => {
    expect(loadConfig().extra.mobileBuildCommit).toBeNull();
  });

  it('derives provenance from the immutable Git HEAD', () => {
    expect(launcher).toContain("git('rev-parse', 'HEAD')");
  });

  it('refuses tracked worktree changes before starting Metro', () => {
    expect(launcher).toContain("'status', '--porcelain', '--untracked-files=no'");
    expect(launcher).toContain('process.exit(1)');
  });

  it('passes the verified commit only to the child Expo process', () => {
    expect(launcher).toContain('MOBILE_BUILD_COMMIT: commit');
    expect(launcher).toContain("'start', '--dev-client'");
  });

  it('retains interactive Expo output for device testing', () => {
    expect(launcher).toContain("stdio: 'inherit'");
  });

  it('emits a bounded device-log marker at app mount', () => {
    expect(rootLayout).toContain('[MOBILE_BUILD] commit=');
    expect(rootLayout).toContain("commit : 'unverified'");
  });
});
