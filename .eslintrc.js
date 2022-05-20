const { configs } = require('@glyph-cat/eslint-config')

const strictConfig = configs.strict

module.exports = {
  root: true,
  ...strictConfig,
}
