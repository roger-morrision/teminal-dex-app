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
  const createConfig = require('../../app.config');
  const app = require('../../app.json');
  const config = createConfig({ config: app.expo });
  if (previous === undefined) delete process.env.MOBILE_BUILD_COMMIT;
  else process.env.MOBILE_BUILD_COMMIT = previous;
  return config;
}

function loadPrivyConfig(values: Record<string, string | undefined>) {
  const keys = ['EXPO_PUBLIC_PRIVY_APP_ID', 'NEXT_PUBLIC_PRIVY_APP_ID', 'EXPO_PUBLIC_PRIVY_CLIENT_ID', 'PRIVY_CLIENT_ID_MOBILE'] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) {
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const createConfig = require('../../app.config');
  const app = require('../../app.json');
  const config = createConfig({ config: app.expo });
  for (const key of keys) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return config.extra as { privyAppId: string | null; privyClientId: string | null };
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
    expect(launcher).toContain("'start',");
    expect(launcher).toContain("'--dev-client',");
    expect(launcher).toContain('expoArgs');
  });

  it('retains interactive Expo output for device testing', () => {
    expect(launcher).toContain("stdio: 'inherit'");
  });

  it('bounds Metro concurrency while preserving an explicit CLI override', () => {
    expect(launcher).toContain("argument === '--max-workers'");
    expect(launcher).toContain("argument.startsWith('--max-workers=')");
    expect(launcher).toContain("requestedWorkerLimit <= 8");
    expect(launcher).toContain("['--max-workers', workerLimit]");
  });

  it('selects a bounded free development port without terminating an existing process', () => {
    expect(launcher).toContain("argument === '--port'");
    expect(launcher).toContain("argument.startsWith('--port=')");
    expect(launcher).toContain('MOBILE_DEV_PORT');
    expect(launcher).toContain('selectDevelopmentPort');
    expect(launcher).toContain('start + 18');
    expect(launcher).not.toContain('Stop-Process');
  });

  it('emits a bounded device-log marker at app mount', () => {
    expect(rootLayout).toContain('[MOBILE_BUILD] commit=');
    expect(rootLayout).toContain("commit : 'unverified'");
  });

  it('maps coordinated WEB App ID and MOBILE Client ID aliases', () => {
    expect(loadPrivyConfig({ NEXT_PUBLIC_PRIVY_APP_ID: 'app-public', PRIVY_CLIENT_ID_MOBILE: 'client-mobile' })).toMatchObject({ privyAppId: 'app-public', privyClientId: 'client-mobile' });
  });

  it('refuses secret-shaped Privy values from public Expo config', () => {
    expect(loadPrivyConfig({ EXPO_PUBLIC_PRIVY_APP_ID: 'app-public', EXPO_PUBLIC_PRIVY_CLIENT_ID: 'privy_app_secret_never_public' })).toMatchObject({ privyAppId: 'app-public', privyClientId: null });
  });
});
