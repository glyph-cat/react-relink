const OFF = 0

const { configs } = require('@glyph-cat/swiss-army-knife/eslint-config')

module.exports = {
  root: true,
  ...configs.strict,
  rules: {
    ...configs.strict.rules,
    'no-console': OFF,
  },
}
