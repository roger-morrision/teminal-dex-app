const app = require('./app.json');

module.exports = {
  ...app.expo,
  extra: {
    ...app.expo.extra,
    mobileBuildCommit: process.env.MOBILE_BUILD_COMMIT || null,
  },
};
