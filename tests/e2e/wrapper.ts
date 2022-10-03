import * as fs from 'fs'
import { IntegrationTestConfig } from '../helpers'
import { stringifyUrl } from 'query-string'

const BASE_TEST_DIR = './tests/e2e'
const LOCAL_HOST = 'http://localhost:3000'
const SCREENSHOTS_DIR_NAME = 'screenshots'

type BuildConfig = Partial<{
  t: IntegrationTestConfig['buildType']
  p: boolean | 0 | 1
}>

interface SandboxUtils {
  loadSandbox: IntegrationTestConfig['loadSandbox']
  screenshotFactory: IntegrationTestConfig['screenshotFactory']
}

function createSandboxUtils(
  buildConfig: BuildConfig = {},
  scnshotSuffix?: string
): SandboxUtils {
  return {
    async loadSandbox(sandboxName: string) {
      await page.setViewport({ height: 900, width: 1200 })
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: buildConfig,
      }))
      await page.waitForSelector('div[data-testid="debug-frame"]', { visible: true })
    },
    screenshotFactory(testName: string) {
      const suffix = scnshotSuffix || buildConfig?.t
      const screenshotsPath = `${BASE_TEST_DIR}/${testName}/${SCREENSHOTS_DIR_NAME}`
      if (!fs.existsSync(screenshotsPath)) { fs.mkdirSync(screenshotsPath) }
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `${screenshotsPath}/${screenshotName}.${suffix}.png`,
            fullPage: true,
          })
        }
      }
    },
  }
}

const SCOPE = process.env.scope
const DEBUG_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'debug',
    buildType: 'es',
    description: 'Debug',
    ...createSandboxUtils({}, 'debug'),
  },
]
const BUNDLED_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'dev',
    buildType: 'cjs',
    description: 'CJS',
    ...createSandboxUtils({ t: 'cjs' }),
  },
  {
    buildEnv: 'dev',
    buildType: 'es',
    description: 'EcmaScript',
    ...createSandboxUtils({ t: 'es' }),
  },
  {
    buildEnv: 'prod',
    buildType: 'es',
    description: 'EcmaScript (Minified)',
    ...createSandboxUtils({ t: 'es', p: 1 }, 'mjs'),
  },
  {
    buildEnv: 'debug',
    buildType: 'rn',
    description: 'React Native',
    ...createSandboxUtils({ t: 'rn' }),
  },
  {
    buildEnv: 'dev',
    buildType: 'umd',
    description: 'UMD',
    ...createSandboxUtils({ t: 'umd' }),
  },
  {
    buildEnv: 'prod',
    buildType: 'umd',
    description: 'UMD (Minified)',
    ...createSandboxUtils({ t: 'umd', p: 1 }, 'umd-min'),
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
  for (const testConfig of testConfigStack) {
    describe(testConfig.description, (): void => {
      // TODO: Find a way to change window size
      executor(testConfig)
    })
  }
}
