import fs from 'fs'
import { IntegrationTestProps, TestBuildConfig } from '../helpers'

jest.mock('scheduler', () => require('scheduler/unstable_mock'))

const SCOPE = process.env.scope
const DEBUG_BUILDS: Array<TestBuildConfig> = [
  {
    buildType: 'es',
    description: 'Debug',
    src: require('../../src/index.ts'),
  },
]
const BUNDLED_BUILDS: Array<TestBuildConfig> = [
  {
    buildType: 'cjs',
    description: 'CJS',
    src: require('../../dist/cjs/index.js'),
  },
  {
    buildType: 'es',
    description: 'EcmaScript',
    src: require('../../dist/es/index.js'),
  },
  // Will fail (unexpected token "import"):
  // { tag: 'ES (Minified)', src: require('../../dist/es/index.mjs') },
  // { tag: 'React Native', src: require('../../dist/native/index.js') },
  {
    buildType: 'umd',
    description: 'UMD',
    src: require('../../dist/umd/index.js'),
  },
  {
    buildType: 'umd',
    description: 'UMD (Minified)',
    src: require('../../dist/umd/index.min.js'),
  },
]

const buildStack: Array<TestBuildConfig> = []
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
  const { description, src } = build
  describe(description, async (): Promise<void> => {
    for (const l of list) {
      const requiredTest = require(`./bases/${l}`)
      const executor = requiredTest.default || requiredTest
      const testProps: IntegrationTestProps = {
        Relink: src,
      }
      await executor(testProps)
    }
  })
}
