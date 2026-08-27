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
const requestedArgs = process.argv.slice(2);
const hasWorkerLimit = requestedArgs.some(
  (argument) => argument === '--max-workers' || argument.startsWith('--max-workers='),
);
const requestedWorkerLimit = Number.parseInt(
  process.env.MOBILE_METRO_MAX_WORKERS ?? '',
  10,
);
const workerLimit =
  Number.isInteger(requestedWorkerLimit) &&
  requestedWorkerLimit >= 1 &&
  requestedWorkerLimit <= 8
    ? String(requestedWorkerLimit)
    : '2';
const expoArgs = [
  'node_modules/expo/bin/cli',
  'start',
  '--dev-client',
  ...(hasWorkerLimit ? [] : ['--max-workers', workerLimit]),
  ...requestedArgs,
];
const result = spawnSync(
  process.execPath,
  expoArgs,
  {
    env: { ...process.env, MOBILE_BUILD_COMMIT: commit },
    stdio: 'inherit',
  },
);

process.exit(result.status ?? 1);
