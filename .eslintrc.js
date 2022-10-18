const { configs } = require('@glyph-cat/eslint-config')

const strictConfigs = configs.strict
const [NRIstatus, NRIconfig] = strictConfigs.rules['no-restricted-imports']

module.exports = {
  root: true,
  ...strictConfigs,
  rules: {
    ...strictConfigs.rules,
    'no-restricted-imports': [NRIstatus, {
      ...NRIconfig,
      paths: [
        ...[...NRIconfig.paths].filter((value) => {
          return value.name !== 'react'
        }),
        {
          name: '@glyph-cat/swiss-army-knife',
          message: '\'@glyph-cat/swiss-army-knife\' depends on this package to work. We are not supposed to import from it. It is only available because other package require it to function.',
        }
      ],
    }],
  },
}
