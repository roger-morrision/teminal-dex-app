import fs from 'fs';
import path from 'path';

describe('Privy platform bundle boundary', () => {
  it('forces the native Privy jose dependency onto WebCrypto instead of Node zlib', () => {
    const config = fs.readFileSync(path.join(process.cwd(), 'metro.config.js'), 'utf8');
    expect(config).toContain("moduleName === 'jose'");
    expect(config).toContain("platform !== 'web'");
    expect(config).toContain("'dist', 'browser', 'index.js'");
  });

  it('keeps native and web Privy SDKs in isolated platform modules', () => {
    const nativeProvider = fs.readFileSync(path.join(process.cwd(), 'src/auth/PrivyAuthProvider.native.tsx'), 'utf8');
    const webProvider = fs.readFileSync(path.join(process.cwd(), 'src/auth/PrivyAuthProvider.web.tsx'), 'utf8');
    expect(nativeProvider).toContain("from '@privy-io/expo'");
    expect(nativeProvider).not.toContain("from '@privy-io/react-auth'");
    expect(webProvider).toContain("from '@privy-io/react-auth'");
    expect(webProvider).not.toContain("from '@privy-io/expo'");
    expect(webProvider).toContain('appId.length === 25');
    expect(webProvider).toContain('if (!configured)');
    expect(nativeProvider).toContain('appId.length === 25');
    expect(nativeProvider).toContain('if (!configured)');
  });
});
