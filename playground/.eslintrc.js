const { configs } = require('@glyph-cat/eslint-config')

const OFF = 0
const recommendedConfig = configs.recommended
const [NRIstatus, NRIconfig] = recommendedConfig.rules['no-restricted-imports']

module.exports = {
  ...recommendedConfig,
  rules: {
    ...recommendedConfig.rules,
    'no-console': OFF,
    'no-restricted-imports': [NRIstatus, {
      ...NRIconfig,
      paths: [
        ...[...NRIconfig.paths].filter((value) => {
          return value.name !== 'react'
        }),
      ],
    }],
  },
}
