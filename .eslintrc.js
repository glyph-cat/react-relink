const { configs } = require('@glyph-cat/eslint-config')

const strictConfig = configs.strict
const [NRIstatus, NRIconfig] = strictConfig.rules['no-restricted-imports']

module.exports = {
  root: true,
  ...strictConfig,
  rules: {
    ...strictConfig.rules,
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
