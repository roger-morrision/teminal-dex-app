const publicIdentifier = (...values) => {
  const value = values.find((candidate) => typeof candidate === 'string' && candidate.trim())?.trim();
  if (!value || /^privy_app_secret_/i.test(value)) return null;
  return value;
};

const publicPrivyAppId = (...values) => {
  const value = publicIdentifier(...values);
  return value?.length === 25 ? value : null;
};

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    mobileBuildCommit: process.env.MOBILE_BUILD_COMMIT || null,
    privyAppId: publicPrivyAppId(process.env.EXPO_PUBLIC_PRIVY_APP_ID, process.env.NEXT_PUBLIC_PRIVY_APP_ID),
    privyClientId: publicIdentifier(process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID, process.env.PRIVY_CLIENT_ID_MOBILE),
  },
});
