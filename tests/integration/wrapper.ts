import { IntegrationTestConfig } from '../helpers'

const SCOPE = process.env.scope
const DEBUG_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'debug',
    buildType: 'es',
    description: 'Debug',
    Relink: require('../../src/bundle.ts'),
  },
]
const BUNDLED_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'dev',
    buildType: 'cjs',
    description: 'CJS',
    Relink: require('../../lib/cjs/index.js'),
  },
  {
    buildEnv: 'dev',
    buildType: 'es',
    description: 'EcmaScript',
    Relink: require('../../lib/es/index.js'),
  },
  // {
  //   buildEnv: 'prod',
  //   buildType: 'es',
  //   description: 'EcmaScript (Minified)',
  //   Relink: require('../../lib/es/index.mjs'),
  //           ^
  //   SyntaxError: Cannot use import statement outside a module
  // },
  {
    buildEnv: 'dev',
    buildType: 'rn',
    description: 'React Native',
    Relink: require('../../lib/native/index.js'),
  },
  {
    buildEnv: 'dev',
    buildType: 'umd',
    description: 'UMD',
    Relink: require('../../lib/umd/index.js'),
  },
  {
    buildEnv: 'prod',
    buildType: 'umd',
    description: 'UMD (Minified)',
    Relink: require('../../lib/umd/index.min.js'),
  },
]

const testConfigStack: Array<IntegrationTestConfig> = []
if (!SCOPE || SCOPE === 'debug') {
  testConfigStack.push(...DEBUG_BUILDS)
}
if (!SCOPE || SCOPE === 'bundled') {
  testConfigStack.push(...BUNDLED_BUILDS)
}

export function wrapper(
  executor: ((cfg: IntegrationTestConfig) => void)
): void {
  // These tests usually don't take very long to complete because they do not
  // depend on Puppeteer, so a shorter timeout is set.
  jest.setTimeout(1000)
  for (const testConfig of testConfigStack) {
    describe(testConfig.description, (): void => {
      executor(testConfig)
    })
  }
}
