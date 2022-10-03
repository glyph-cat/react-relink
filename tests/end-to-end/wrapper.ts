import { IntegrationTestConfig } from '../helpers'
import { stringifyUrl } from 'query-string'

const LOCAL_HOST = 'http://localhost:3000'
const SCOPE = process.env.scope
const DEBUG_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'debug',
    buildType: 'es',
    description: 'Debug',
    async loadSandbox(sandboxName: string) {
      await page.goto(`${LOCAL_HOST}/${sandboxName}`)
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            // TOFIX: Auto create folder (also fix for other builds)
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.debug.png`,
            fullPage: true,
          })
        }
      }
    },
  },
]
const BUNDLED_BUILDS: Array<IntegrationTestConfig> = [
  {
    buildEnv: 'dev',
    buildType: 'cjs',
    description: 'CJS',
    async loadSandbox(sandboxName: string) {
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: { t: 'cjs' },
      }))
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.cjs.png`,
            fullPage: true,
          })
        }
      }
    },
  },
  {
    buildEnv: 'dev',
    buildType: 'es',
    description: 'EcmaScript',
    async loadSandbox(sandboxName: string) {
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: { t: 'es' },
      }))
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.es.png`,
            fullPage: true,
          })
        }
      }
    },
  },
  {
    buildEnv: 'prod',
    buildType: 'es',
    description: 'EcmaScript (Minified)',
    async loadSandbox(sandboxName: string) {
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: { t: 'es', p: 1 },
      }))
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.mjs.png`,
            fullPage: true,
          })
        }
      }
    },
  },
  {
    buildEnv: 'debug',
    buildType: 'rn',
    description: 'React Native',
    async loadSandbox(sandboxName: string) {
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: { t: 'rn' },
      }))
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.rn.png`,
            fullPage: true,
          })
        }
      }
    },
  },
  {
    buildEnv: 'dev',
    buildType: 'umd',
    description: 'UMD',
    async loadSandbox(sandboxName: string) {
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: { t: 'umd' },
      }))
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.umd.png`,
            fullPage: true,
          })
        }
      }
    },
  },
  {
    buildEnv: 'prod',
    buildType: 'umd',
    description: 'UMD (Minified)',
    async loadSandbox(sandboxName: string) {
      await page.goto(stringifyUrl({
        url: `${LOCAL_HOST}/${sandboxName}`,
        query: { t: 'umd', p: 1 },
      }))
    },
    screenshotFactory(testName: string) {
      return {
        async snap(screenshotName: string) {
          await page.screenshot({
            path: `./tests/integration/${testName}/screenshots/${screenshotName}.umd-min.png`,
            fullPage: true,
          })
        }
      }
    },
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
