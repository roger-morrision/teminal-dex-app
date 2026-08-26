import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const nestedRoot = 'node_modules/@solana/wallet-standard-util/node_modules';
const curvesLock = lock.packages[`${nestedRoot}/@noble/curves`];
const hashesLock = lock.packages[`${nestedRoot}/@noble/hashes`];
const hashesPackage = JSON.parse(
  readFileSync(join(root, nestedRoot, '@noble/hashes/package.json'), 'utf8'),
);

describe('Noble Metro fallback compatibility', () => {
  it('pins the audited nested curves and hashes pair', () => {
    expect(curvesLock.version).toBe('1.9.7');
    expect(curvesLock.dependencies['@noble/hashes']).toBe('1.8.0');
    expect(hashesLock.version).toBe('1.8.0');
  });

  it('records the strict export that causes Metro to warn', () => {
    expect(hashesPackage.exports['./crypto']).toBeDefined();
    expect(hashesPackage.exports['./crypto.js']).toBeUndefined();
  });

  it('requires the fallback CommonJS file to remain installed', () => {
    expect(existsSync(join(root, nestedRoot, '@noble/hashes/crypto.js'))).toBe(true);
  });

  it('requires the fallback ESM file to remain installed', () => {
    expect(existsSync(join(root, nestedRoot, '@noble/hashes/esm/crypto.js'))).toBe(true);
  });

  it('forbids an unreviewed root override of the cryptography pair', () => {
    expect(lock.packages[''].overrides?.['@noble/curves']).toBeUndefined();
    expect(lock.packages[''].overrides?.['@noble/hashes']).toBeUndefined();
  });
});
