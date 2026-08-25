const { withMainApplication } = require('@expo/config-plugins');

const IMPORT_MARKER = 'import com.facebook.react.devsupport.DevMenuConfiguration';
const HOST_CONFIGURATION = `    ).apply {
      if (BuildConfig.DEBUG) {
        setDevMenuConfiguration(
          DevMenuConfiguration(shakeGestureEnabled = false)
        )
      }
    }`;

module.exports = function withAndroidDevMenuSafety(config) {
  return withMainApplication(config, (next) => {
    if (next.modResults.language !== 'kt') {
      throw new Error('Terminal DEX Android MainApplication must use Kotlin.');
    }

    let contents = next.modResults.contents;
    if (!contents.includes(IMPORT_MARKER)) {
      contents = contents.replace(
        'import com.facebook.react.common.ReleaseLevel',
        `import com.facebook.react.common.ReleaseLevel\n${IMPORT_MARKER}`,
      );
    }

    if (!contents.includes('DevMenuConfiguration(shakeGestureEnabled = false)')) {
      const hostEnd = `    )\n  }`;
      if (!contents.includes(hostEnd)) {
        throw new Error('Unable to locate the Expo ReactHost factory in MainApplication.kt.');
      }
      contents = contents.replace(hostEnd, `${HOST_CONFIGURATION}\n  }`);
    }

    next.modResults.contents = contents;
    return next;
  });
};
