import { IntegrationTestConfig } from '../helpers'

const SCOPE = process.env.scope
const DEBUG_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'debug',
    buildType: 'es',
    description: 'Debug',
    Relink: require('../../src/index.ts'),
  },
]
const DISTRIBUTABLE_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'dev',
    buildType: 'cjs',
    description: 'CJS',
    Relink: require('../../dist/cjs/index.js'),
  },
  {
    buildEnv: 'dev',
    buildType: 'es',
    description: 'EcmaScript',
    Relink: require('../../dist/es/index.js'),
  },
  {
    buildEnv: 'dev',
    buildType: 'umd',
    description: 'UMD',
    Relink: require('../../dist/umd/index.js'),
  },
  {
    buildEnv: 'prod',
    buildType: 'umd',
    description: 'UMD (Minified)',
    Relink: require('../../dist/umd/index.min.js'),
  },
]

// NOTE: RN and ES minified builds will fail to run with the error
// > unexpected token "import"

const testConfigStack: Array<IntegrationTestConfig> = []
if (!SCOPE || SCOPE === 'debug') {
  testConfigStack.push(...DEBUG_BUILDS)
}
if (!SCOPE || SCOPE === 'bundled') {
  testConfigStack.push(...DISTRIBUTABLE_BUILDS)
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
