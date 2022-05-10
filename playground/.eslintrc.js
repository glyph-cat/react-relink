const { configs } = require('@glyph-cat/eslint-config')

const strictConfig = configs.strict
const OFF = 0

module.exports = {
  root: true,
  ...strictConfig,
  rules: {
    ...strictConfig.rules,
    'no-console': OFF,
  },
}
