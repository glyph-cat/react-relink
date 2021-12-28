const { configs } = require('@glyph-cat/swiss-army-knife/eslint-config')

module.exports = {
  root: true,
  ...configs.strict,
}
