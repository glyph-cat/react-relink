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
  // },
  // {
  //   buildEnv: 'debug',
  //   buildType: 'rn',
  //   description: 'React Native',
  //   Relink: require('../../lib/native/index.js'),
  // },
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

// NOTE: RN and ES minified builds will fail to run with the error
// > unexpected token "import"

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
  for (const testConfig of testConfigStack) {
    describe(testConfig.description, (): void => {
      executor(testConfig)
    })
  }
}
