module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    mobileBuildCommit: process.env.MOBILE_BUILD_COMMIT || null,
    privyAppId: process.env.EXPO_PUBLIC_PRIVY_APP_ID || null,
    privyClientId: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || null,
  },
});
