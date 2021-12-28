import fs from 'fs'

jest.mock('scheduler', () => require('scheduler/unstable_mock'))

const SCOPE = process.env.scope
const DEBUG_BUILDS = [
  { tag: 'Debug', src: require('../../src/index.js'), debug: true },
]
const BUNDLED_BUILDS = [
  { tag: 'CJS', src: require('../../dist/cjs/index.js'), debug: true },
  { tag: 'UMD', src: require('../../dist/umd/index.js'), debug: true },
  { tag: 'UMD (Minified)', src: require('../../dist/umd/index.min.js') },
  { tag: 'ES', src: require('../../dist/es/index.js'), debug: true },
  // --------------------------------------------------
  // // Will fail (unexpected token "import")
  // { tag: 'ES (Minified)', src: require('../../dist/es/index.mjs') },
  // // Doesn't use ReactDOM
  // { tag: 'React Native', src: require('../../dist/native/index.js'), debug: true },
]

let buildStack = []
if (!SCOPE || SCOPE === 'debug') {
  buildStack.push(...DEBUG_BUILDS)
}
if (!SCOPE || SCOPE === 'bundled') {
  buildStack.push(...BUNDLED_BUILDS)
}

const list = fs.readdirSync('./tests/integration/bases', {
  encoding: 'utf-8',
})

for (const build of buildStack) {
  const { tag, src, debug } = build
  describe(tag, () => {
    for (const l of list) {
      const requiredTest = require(`./bases/${l}`)
      const executor = requiredTest.default || requiredTest
      executor({
        Relink: src,
        buildEnv: {
          tag,
          IS_DEBUG_ENV: debug,
        },
      })
    }
  })
}
