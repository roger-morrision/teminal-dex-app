import { execFileSync, spawnSync } from 'node:child_process';
import process from 'node:process';

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const commit = git('rev-parse', 'HEAD');
const trackedChanges = git('status', '--porcelain', '--untracked-files=no');

if (trackedChanges) {
  console.error('Verified development requires a clean tracked worktree.');
  process.exit(1);
}

console.log(`Starting verified MOBILE development bundle at ${commit}.`);
const result = spawnSync(
  process.execPath,
  ['node_modules/expo/bin/cli', 'start', '--dev-client', ...process.argv.slice(2)],
  {
    env: { ...process.env, MOBILE_BUILD_COMMIT: commit },
    stdio: 'inherit',
  },
);

process.exit(result.status ?? 1);
