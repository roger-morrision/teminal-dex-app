import { execFileSync, spawn } from 'node:child_process';
import { closeSync, existsSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const statePath = join(tmpdir(), 'terminal-dex-mobile-verified-runtime.json');
const stdoutPath = join(tmpdir(), 'terminal-dex-mobile-verified-runtime.stdout.log');
const stderrPath = join(tmpdir(), 'terminal-dex-mobile-verified-runtime.stderr.log');

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function boundedPort(flag, fallback) {
  const inline = process.argv.find((value) => value.startsWith(`${flag}=`));
  const separate = process.argv.indexOf(flag);
  const raw = inline?.slice(flag.length + 1) ?? (separate >= 0 ? process.argv[separate + 1] : '');
  const value = Number.parseInt(raw, 10);
  return Number.isInteger(value) && value >= 1024 && value <= 65535 ? value : fallback;
}

function pidAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function portAvailable(port) {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.unref();
    server.once('error', () => resolvePort(false));
    server.listen({ host: '127.0.0.1', port, exclusive: true }, () => server.close(() => resolvePort(true)));
  });
}

function portListening(port) {
  return new Promise((resolvePort) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(500);
    socket.once('connect', () => { socket.destroy(); resolvePort(true); });
    socket.once('timeout', () => { socket.destroy(); resolvePort(false); });
    socket.once('error', () => resolvePort(false));
  });
}

async function waitForPorts(ports, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await Promise.all(ports.map(portListening))).every(Boolean)) return true;
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  return false;
}

function readState() {
  if (!existsSync(statePath)) return null;
  try { return JSON.parse(readFileSync(statePath, 'utf8')); } catch { return null; }
}

function stopOwned(state) {
  if (!state || state.root !== root) throw new Error('Refusing to stop an unowned runtime state.');
  for (const pid of [state.metroPid, state.fixturePid]) {
    if (pidAlive(pid)) {
      try { process.kill(pid, 'SIGTERM'); } catch { /* process exited after ownership check */ }
    }
  }
  rmSync(statePath, { force: true });
}

async function start() {
  const commit = git('rev-parse', 'HEAD');
  if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('Verified QA runtime requires a clean tracked worktree.');
  const prior = readState();
  if (prior && (pidAlive(prior.metroPid) || pidAlive(prior.fixturePid))) throw new Error('A recorded verified QA runtime is already active. Stop it first.');
  rmSync(statePath, { force: true });
  const metroPort = boundedPort('--metro-port', 8101);
  const fixturePort = boundedPort('--fixture-port', 3099);
  if (metroPort === fixturePort || !(await portAvailable(metroPort)) || !(await portAvailable(fixturePort))) {
    throw new Error('Requested verified-runtime ports must be distinct and available.');
  }
  const stdout = openSync(stdoutPath, 'w');
  const stderr = openSync(stderrPath, 'w');
  let fixture;
  let metro;
  try {
    fixture = spawn(process.execPath, ['scripts/qa-provider-fixture.mjs'], {
      cwd: root, detached: true, stdio: ['ignore', stdout, stderr],
      env: { ...process.env, MOBILE_QA_FIXTURE_PORT: String(fixturePort) },
    });
    metro = spawn(process.execPath, ['node_modules/expo/bin/cli', 'start', '--dev-client', '--web', '--port', String(metroPort), '--max-workers', '2'], {
      cwd: root, detached: true, stdio: ['ignore', stdout, stderr],
      env: {
        ...process.env,
        MOBILE_BUILD_COMMIT: commit,
        EXPO_PUBLIC_API_URL: `http://127.0.0.1:${fixturePort}`,
      },
    });
    fixture.unref();
    metro.unref();
    const state = { schema: 1, root, commit, metroPort, fixturePort, metroPid: metro.pid, fixturePid: fixture.pid, startedAt: new Date().toISOString(), stdoutPath, stderrPath };
    writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    if (!(await waitForPorts([fixturePort, metroPort]))) throw new Error('Verified QA runtime did not become reachable within 120 seconds.');
    console.log(JSON.stringify({ started: true, ...state }));
  } catch (error) {
    if (metro && pidAlive(metro.pid)) process.kill(metro.pid, 'SIGTERM');
    if (fixture && pidAlive(fixture.pid)) process.kill(fixture.pid, 'SIGTERM');
    rmSync(statePath, { force: true });
    throw error;
  } finally {
    closeSync(stdout);
    closeSync(stderr);
  }
}

const command = process.argv[2];
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (command === 'start') await start();
  else if (command === 'stop') {
    const state = readState();
    if (!state) console.log(JSON.stringify({ stopped: false, reason: 'not_running' }));
    else { stopOwned(state); console.log(JSON.stringify({ stopped: true, metroPid: state.metroPid, fixturePid: state.fixturePid })); }
  } else if (command === 'status') {
    const state = readState();
    console.log(JSON.stringify(state ? { ...state, metroAlive: pidAlive(state.metroPid), fixtureAlive: pidAlive(state.fixturePid) } : { running: false }));
  } else {
    console.error('Usage: verified-qa-runtime.mjs start|status|stop [--metro-port N] [--fixture-port N]');
    process.exitCode = 2;
  }
}
