import { spawnSync } from 'node:child_process';
import { delimiter, dirname, join } from 'node:path';
import process from 'node:process';

// Expo Doctor launches child `node` processes by command name. Codex and other
// isolated Windows shells can supply process.execPath without placing its
// directory on PATH, which previously made healthy projects fail with ENOENT.
const nodeDirectory = dirname(process.execPath);
const pathKey = Object.keys(process.env).find(
  (key) => key.toLowerCase() === 'path',
) ?? 'PATH';
const inheritedPath = process.env[pathKey] ?? '';
const childPath = [nodeDirectory, inheritedPath].filter(Boolean).join(delimiter);
const doctorEntry = join(
  process.cwd(),
  'node_modules',
  'expo-doctor',
  'bin',
  'expo-doctor.js',
);

const result = spawnSync(
  process.execPath,
  [doctorEntry, ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    env: { ...process.env, [pathKey]: childPath },
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error(`Unable to start Expo Doctor: ${result.error.message}`);
}

process.exit(result.status ?? 1);
