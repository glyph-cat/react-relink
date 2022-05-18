const { configs } = require('@glyph-cat/eslint-config')

const recommendedConfig = configs.recommended
const OFF = 0

module.exports = {
  root: true,
  ...recommendedConfig,
  rules: {
    ...recommendedConfig.rules,
    'no-console': OFF,
  },
}
