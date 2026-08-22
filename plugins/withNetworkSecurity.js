const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNetworkSecurity(config) {
  return withAndroidManifest(config, (next) => {
    const application = next.modResults.manifest.application?.[0];
    if (!application) throw new Error('Android manifest application node is missing.');
    application.$['android:usesCleartextTraffic'] = 'false';
    application.$['android:allowBackup'] = 'false';
    return next;
  });
};
