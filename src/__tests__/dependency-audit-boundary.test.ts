import fs from 'node:fs';
import path from 'node:path';

type LockPackage = {
  version?: string;
  dependencies?: Record<string, string>;
};

type Lockfile = {
  packages: Record<string, LockPackage>;
};

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
const lockfile = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')) as Lockfile;

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(ts|tsx)$/.test(entry.name) ? [target] : [];
  });
}

describe('dependency audit runtime boundary', () => {
  test.each(['uuid', 'xcode', '@expo/config-plugins'])(
    '%s is not a direct application dependency',
    (dependency) => {
      expect(manifest.dependencies).not.toHaveProperty(dependency);
      expect(manifest.devDependencies).not.toHaveProperty(dependency);
    },
  );

  it('keeps xcode behind the Expo configuration toolchain', () => {
    expect(lockfile.packages['node_modules/@expo/config-plugins']?.dependencies?.xcode).toBe(
      '^3.0.1',
    );
    expect(lockfile.packages['node_modules/xcode']?.dependencies?.uuid).toBe('^7.0.3');
  });

  it('records the audited transitive versions for upstream remediation tracking', () => {
    expect(lockfile.packages['node_modules/xcode']?.version).toBe('3.0.1');
    expect(lockfile.packages['node_modules/uuid']?.version).toBe('7.0.3');
  });

  it('does not import the audited build-tool packages in application runtime source', () => {
    const runtimeSource = [...sourceFiles(path.join(root, 'app')), ...sourceFiles(path.join(root, 'src'))]
      .filter((file) => file !== __filename)
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');

    expect(runtimeSource).not.toMatch(/(?:from|require\s*\()\s*['\"](?:uuid|xcode)['\"]/);
  });
});
