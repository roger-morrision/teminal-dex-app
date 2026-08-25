// eslint-disable-next-line @typescript-eslint/no-require-imports
const { configureAndroidDevMenu } = require('../../plugins/withAndroidDevMenuSafety');

const kotlinTemplate = `package app.terminaldex.mobile

import com.facebook.react.common.ReleaseLevel

class MainApplication {
  val reactHost = ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList = emptyList()
    )
  }
}`;

describe('Android development-menu startup safety', () => {
  it('disables only the shake gesture in debug builds', () => {
    const result = configureAndroidDevMenu(kotlinTemplate, 'kt');

    expect(result).toContain('if (BuildConfig.DEBUG)');
    expect(result).toContain('DevMenuConfiguration(shakeGestureEnabled = false)');
  });

  it('retains keyboard and ADB developer-menu access defaults', () => {
    const result = configureAndroidDevMenu(kotlinTemplate, 'kt');

    expect(result).not.toContain('devMenuEnabled = false');
    expect(result).not.toContain('keyboardShortcutsEnabled = false');
  });

  it('injects the required React Native configuration import', () => {
    expect(configureAndroidDevMenu(kotlinTemplate, 'kt')).toContain(
      'import com.facebook.react.devsupport.DevMenuConfiguration',
    );
  });

  it('is idempotent across repeated native regeneration', () => {
    const once = configureAndroidDevMenu(kotlinTemplate, 'kt');
    const twice = configureAndroidDevMenu(once, 'kt');

    expect(twice).toBe(once);
  });

  it('fails closed when the generated application is not Kotlin', () => {
    expect(() => configureAndroidDevMenu(kotlinTemplate, 'java')).toThrow(
      'Terminal DEX Android MainApplication must use Kotlin.',
    );
  });

  it('fails closed when the Expo host template changes unexpectedly', () => {
    expect(() => configureAndroidDevMenu('class MainApplication', 'kt')).toThrow(
      'Unable to locate the Expo ReactHost factory in MainApplication.kt.',
    );
  });
});
