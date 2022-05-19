// Reference: https://stackoverflow.com/a/61532563/5810737

require('ts-node').register({
  compilerOptions: {
    module: 'CommonJS',
    resolveJsonModule: true,
  },
})

module.exports = require('./rollup.config.ts')
