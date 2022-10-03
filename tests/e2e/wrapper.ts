import * as fs from 'fs'
import { stringifyUrl } from 'query-string'
import { IntegrationTestConfig } from '../helpers'
import { StatusBarTestId } from '../../playground/web/components/debug-frame/status-bar/constants'
import { MutableRefObject } from 'react'

const BASE_TEST_DIR = './tests/e2e'
const LOCAL_HOST = 'http://localhost:3000'
const SCREENSHOTS_DIR_NAME = 'screenshots'

type BuildConfig = Partial<{
  t: IntegrationTestConfig['buildType']
  p: boolean | 0 | 1
}>

const SCOPE = process.env.scope
const testConfigStack: Array<IntegrationTestConfig> = []
if (!SCOPE || SCOPE === 'debug') {
  testConfigStack.push({
    buildEnv: 'debug',
    buildType: 'es',
    description: 'Debug',
    loadSandbox: createSandboxLoader({}, 'debug'),
  })
}
if (!SCOPE || SCOPE === 'bundled') {
  testConfigStack.push({
    buildEnv: 'dev',
    buildType: 'cjs',
    description: 'CJS',
    loadSandbox: createSandboxLoader({ t: 'cjs' }),
  })
  testConfigStack.push({
    buildEnv: 'dev',
    buildType: 'es',
    description: 'EcmaScript',
    loadSandbox: createSandboxLoader({ t: 'es' }),
  })
  testConfigStack.push({
    buildEnv: 'prod',
    buildType: 'es',
    description: 'EcmaScript (Minified)',
    loadSandbox: createSandboxLoader({ t: 'es', p: 1 }, 'mjs'),
  })
  testConfigStack.push({
    buildEnv: 'debug',
    buildType: 'rn',
    description: 'React Native',
    loadSandbox: createSandboxLoader({ t: 'rn' }),
  })
  testConfigStack.push({
    buildEnv: 'dev',
    buildType: 'umd',
    description: 'UMD',
    loadSandbox: createSandboxLoader({ t: 'umd' }),
  })
  testConfigStack.push({
    buildEnv: 'prod',
    buildType: 'umd',
    description: 'UMD (Minified)',
    loadSandbox: createSandboxLoader({ t: 'umd', p: 1 }, 'umd-min'),
  })
}

function createSandboxLoader(
  buildConfig: BuildConfig = {},
  scnshotSuffix?: string
) {
  const loadSandbox = async (sandboxName: string) => {
    const renderCounterElement: MutableRefObject<HTMLSpanElement> = { current: null }
    await page.goto(stringifyUrl({
      url: `${LOCAL_HOST}/${sandboxName}`,
      query: buildConfig,
    }))
    await page.waitForSelector('div[data-test-id="debug-frame"]', { visible: true })
    await page.evaluateHandle(($renderCounterElement, $dataTestId) => {
      const element = document.querySelector(`span[data-test-id="${$dataTestId}"]`)
      $renderCounterElement.current = element as HTMLSpanElement
    }, renderCounterElement, StatusBarTestId.RENDER_COUNT)
    return {
      screenshotFactory() {
        const suffix = scnshotSuffix || buildConfig?.t
        const screenshotsPath = `${BASE_TEST_DIR}/${sandboxName}/${SCREENSHOTS_DIR_NAME}`
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
      async getRenderCount(): Promise<number> {
        await page.waitForSelector(`span[data-test-id="${StatusBarTestId.RENDER_COUNT}"]`)
        const evaluation = await page.evaluateHandle(($dataTestId) => {
          const element = document.querySelector(`span[data-test-id="${$dataTestId}"]`)
          return Number(element.textContent)
        }, StatusBarTestId.RENDER_COUNT)
        return evaluation.jsonValue()
      },
      sessionStorage: {
        async getItem(key: string): Promise<string> {
          const evaluation = await page.evaluateHandle(($key) => {
            return sessionStorage.getItem($key)
          }, key)
          return evaluation.jsonValue()
        }
      },
    }
  }
  return loadSandbox
}

export function wrapper(
  executor: ((cfg: IntegrationTestConfig) => void)
): void {
  for (const testConfig of testConfigStack) {
    describe(testConfig.description, (): void => {
      beforeEach(async () => {
        await page.setViewport({ height: 900, width: 1200 })
      })
      executor(testConfig)
    })
  }
}
