const configs = require('@glyph-cat/swiss-army-knife/eslint-config')

const OFF = 0

module.exports = {
  root: true,
  ...configs.strict,
  rules: {
    ...configs.strict.rules,
    'import/no-cycle': OFF,
  },
}
