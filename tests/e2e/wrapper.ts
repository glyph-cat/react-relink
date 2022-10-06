import * as fs from 'fs'
import { stringifyUrl } from 'query-string'
import { IntegrationTestConfig, ISandbox, WrapperObject } from '../helpers'
import { StatusBarTestId } from '../../playground/web/components/debug-frame/status-bar/constants'
import { MutableRefObject } from 'react'

const BASE_TEST_DIR = './tests/e2e'
const LOCAL_HOST = 'http://localhost:3000'
const SCREENSHOTS_DIR_NAME = 'screenshots'

const SCOPE = process.env.scope
const testConfigStack: Array<IntegrationTestConfig> = []
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
  executor: ((obj: WrapperObject) => void)
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

        return {
          async getRenderCount(): Promise<number> {
            await page.waitForSelector(`span[data-test-id="${StatusBarTestId.RENDER_COUNT}"]`)
            const evaluation = await page.evaluateHandle(($dataTestId) => {
              const element = document.querySelector(`span[data-test-id="${$dataTestId}"]`)
              return Number(element.textContent)
            }, StatusBarTestId.RENDER_COUNT)
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
        }
      }

      executor({ ...testConfig, loadSandbox })
    })
  }
}
