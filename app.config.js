module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    mobileBuildCommit: process.env.MOBILE_BUILD_COMMIT || null,
  },
});
