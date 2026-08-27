import { execFileSync, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
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
const hasExplicitPort = requestedArgs.some(
  (argument) => argument === '--port' || argument.startsWith('--port='),
);
const requestedPort = Number.parseInt(process.env.MOBILE_DEV_PORT ?? '', 10);
const firstPort =
  Number.isInteger(requestedPort) && requestedPort >= 1024 && requestedPort <= 65535
    ? requestedPort
    : 8081;

function portAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function selectDevelopmentPort(start) {
  for (let port = start; port <= Math.min(start + 18, 65535); port += 1) {
    if (await portAvailable(port)) return port;
  }
  throw new Error(`No available development port from ${start} through ${Math.min(start + 18, 65535)}.`);
}

const developmentPort = hasExplicitPort
  ? null
  : await selectDevelopmentPort(firstPort);
if (developmentPort !== null && developmentPort !== firstPort) {
  console.log(`Port ${firstPort} is occupied; using verified MOBILE port ${developmentPort}.`);
}
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
  ...(developmentPort === null ? [] : ['--port', String(developmentPort)]),
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
