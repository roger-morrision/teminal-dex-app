import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);

if (args.length === 1 && args[0] === '--version') {
  // This is the npm 8+ read-only command surface implemented below, not a
  // package installer. Expo Doctor only uses it for version gating/explain.
  console.log('10.0.0');
  process.exit(0);
}

if (args[0] === 'explain' && typeof args[1] === 'string') {
  const packageName = args[1];
  const lock = JSON.parse(
    readFileSync(join(process.cwd(), 'package-lock.json'), 'utf8'),
  );
  const suffix = `node_modules/${packageName}`;
  const matches = Object.entries(lock.packages ?? {})
    .filter(([path]) => path === suffix || path.endsWith(`/${suffix}`))
    .map(([path, value]) => ({
      name: packageName,
      version: value.version,
      location: path,
      isWorkspace: false,
    }));

  if (matches.length === 0) {
    console.error(`No dependencies found matching ${packageName}`);
    process.exit(1);
  }

  console.log(JSON.stringify(matches));
  process.exit(0);
}

console.error('Doctor npm inspector supports only --version and read-only explain.');
process.exit(1);
