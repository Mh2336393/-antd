module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'import/named': 0,
    'import/no-dynamic-require': 0,
    'global-require': 0,
    'no-restricted-properties': 0,
    'array-callback-return': 0,
  },
};
