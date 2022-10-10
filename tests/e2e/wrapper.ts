import * as fs from 'fs'
import { ElementHandle, NodeFor, WaitForSelectorOptions } from 'puppeteer'
import { MutableRefObject } from 'react'
import { stringifyUrl } from 'query-string'
import { E2ETestConfig, ISandbox, E2EWrapperObject } from '../helpers'
import { StatusBarTestId } from '../../playground/web/components/debug-frame/status-bar/constants'

const BASE_TEST_DIR = './tests/e2e'
const LOCAL_HOST = 'http://localhost:3000'
const SCREENSHOTS_DIR_NAME = 'screenshots'

const SCOPE = process.env.scope
const testConfigStack: Array<E2ETestConfig> = []
if (!SCOPE || SCOPE === 'debug') {
  testConfigStack.push({
    buildEnv: 'debug',
    buildType: 'es',
    description: 'Debug',
    sandboxConfig: { screenshotSuffix: 'debug' },
  })
}
if (!SCOPE || SCOPE === 'bundled') {
  testConfigStack.push({
    buildEnv: 'dev',
    buildType: 'cjs',
    description: 'CJS',
    sandboxConfig: { t: 'cjs' },
  })
  testConfigStack.push({
    buildEnv: 'dev',
    buildType: 'es',
    description: 'EcmaScript',
    sandboxConfig: { t: 'es' },
  })
  testConfigStack.push({
    buildEnv: 'prod',
    buildType: 'es',
    description: 'EcmaScript (Minified)',
    sandboxConfig: { t: 'es', p: 1, screenshotSuffix: 'mjs' },
  })
  testConfigStack.push({
    buildEnv: 'debug',
    buildType: 'rn',
    description: 'React Native',
    sandboxConfig: { t: 'rn' },
  })
  testConfigStack.push({
    buildEnv: 'dev',
    buildType: 'umd',
    description: 'UMD',
    sandboxConfig: { t: 'umd' },
  })
  testConfigStack.push({
    buildEnv: 'prod',
    buildType: 'umd',
    description: 'UMD (Minified)',
    sandboxConfig: { t: 'umd', p: 1, screenshotSuffix: 'umd-min' },
  })
}

export function wrapper(
  executor: ((obj: E2EWrapperObject) => void)
): void {

  for (const testConfig of testConfigStack) {
    describe(testConfig.description, (): void => {

      const screenshotSuffix = testConfig.sandboxConfig.screenshotSuffix || testConfig.sandboxConfig.t
      const sandboxNameRef: MutableRefObject<string> = { current: null }
      const getScreenshotDirPath = (): string => {
        if (!sandboxNameRef.current) { throw new Error('sandboxName is not set!') }
        return `${BASE_TEST_DIR}/${sandboxNameRef.current}/${SCREENSHOTS_DIR_NAME}`
      }

      /**
       * Array of screenshots as a base64 string.
       */
      let screenshotStack: Array<string | Buffer> = []
      const testPassedRef: MutableRefObject<boolean> = { current: false }
      beforeEach(() => {
        testPassedRef.current = false
        screenshotStack = []
      })
      afterEach(async () => {
        if (!testPassedRef.current) {
          const screenshotDirPath = getScreenshotDirPath()
          if (!fs.existsSync(screenshotDirPath)) { fs.mkdirSync(screenshotDirPath) }
          if (screenshotStack.length <= 0) {
            // eslint-disable-next-line no-console
            console.warn(
              `No screenshots were taken for "${sandboxNameRef.current}" (${screenshotSuffix})`
            )
            return // Early exit
          }
          for (let i = 0; i < screenshotStack.length; i++) {
            const screenshotAsBase64String = screenshotStack[i]
            const screenshotFilePath = `${screenshotDirPath}/${screenshotSuffix}_CHECKPOINT_${String(i + 1).padStart(3, '0')}.png`
            fs.writeFileSync(screenshotFilePath, screenshotAsBase64String, 'utf-8')
          }
        }
      })

      async function $$waitForSelector<Selector extends string>(
        selector: Selector,
        options?: WaitForSelectorOptions
      ): Promise<ElementHandle<NodeFor<Selector>> | null> {
        return await page.waitForSelector(selector, {
          timeout: 500,
          visible: true,
          ...options,
        })
      }

      const loadSandbox = async (sandboxName: string): Promise<ISandbox> => {

        const {
          screenshotSuffix: toExclude,
          ...buildConfig
        } = testConfig.sandboxConfig
        sandboxNameRef.current = sandboxName
        await page.goto(stringifyUrl({
          url: `${LOCAL_HOST}/${sandboxName}`,
          query: buildConfig,
        }))
        await $$waitForSelector('div[data-test-id="debug-frame"]')

        return {
          async getRenderCount(customTestId?: string): Promise<number> {
            const targetTestId = customTestId || StatusBarTestId.RENDER_COUNT
            await $$waitForSelector(`span[data-test-id="${targetTestId}"]`)
            const evaluation = await page.evaluateHandle(($targetTestId) => {
              const element = document.querySelector(`span[data-test-id="${$targetTestId}"]`)
              return Number(element.textContent)
            }, targetTestId)
            return evaluation.jsonValue()
          },
          screenshot: {
            async snap(name: string): Promise<void> {
              const screenshotDirPath = getScreenshotDirPath()
              if (!fs.existsSync(screenshotDirPath)) { fs.mkdirSync(screenshotDirPath) }
              await page.screenshot({
                path: `${screenshotDirPath}/${name}.${screenshotSuffix}.png`,
                fullPage: true,
              })
            },
            async checkpoint(): Promise<void> {
              const screenshotAsBase64String = await page.screenshot({ fullPage: true })
              screenshotStack.push(screenshotAsBase64String)
            },
          },
          sessionStorage: {
            async getItem(key: string): Promise<string> {
              const evaluation = await page.evaluateHandle(($key) => {
                return sessionStorage.getItem($key)
              }, key)
              return evaluation.jsonValue()
            }
          },
          localStorage: {
            async getItem(key: string): Promise<string> {
              const evaluation = await page.evaluateHandle(($key) => {
                return localStorage.getItem($key)
              }, key)
              return evaluation.jsonValue()
            }
          },
          async concludeTest() {
            testPassedRef.current = true
          },
          waitForSelector: $$waitForSelector,
        }
      }

      executor({ ...testConfig, loadSandbox })
    })
  }
}
