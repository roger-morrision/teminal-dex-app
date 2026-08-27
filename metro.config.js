const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;
const joseBrowserEntry = path.join(path.dirname(require.resolve('jose/package.json')), 'dist', 'browser', 'index.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // jose@4 exposes Node's zlib entry before its browser entry. Privy's Expo SDK
  // needs the WebCrypto implementation on native; keep web/default resolution intact.
  if (moduleName === 'jose' && platform !== 'web') {
    return { filePath: joseBrowserEntry, type: 'sourceFile' };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
