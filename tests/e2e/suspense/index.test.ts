import {
  CounterValues,
  TestId as SandboxTestId,
} from '../../../playground/web/sandboxes/suspense/constants'
import {
  COUNTER_VALUE_TEST_ID,
} from '../../../playground/web/components/counter-value/constants'
import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {

  // if (buildEnv === 'debug' || buildType === 'cjs' || buildType === 'es') {
  //   test('N/A', async () => {
  //     await loadSandbox('suspense')
  //     expect(null).toBe(null)
  //   })
  //   return // Early exit
  // }

  test.skip('Suspense', async () => {

    const sandbox = await loadSandbox('suspense')

    const getCounterValue = async (): Promise<number> => {
      const evaluation = await page.evaluateHandle(($testId) => {
        const element = document.querySelector(`h1[data-test-id='${$testId}']`)
        return Number(element?.innerHTML)
      }, COUNTER_VALUE_TEST_ID)
      return evaluation.jsonValue()
    }

    // TOFIX: Not sure why element is null for DEBUG, CJS and ES builds
    // (Used to be DEBUG and CJS builds only)
    // (if these builds are skipped, then other builds will fail instead, WTF)
    // (if this entire test is skipped, some other test would fail, but inconsistently, WTF WTF)
    // This only happens when multiple build types are run together
    // (Eg: with `yarn test`), but when running `yarn debug`, it works just fine.
    const isComponentSuspended = async (): Promise<boolean> => {
      const evaluation = await page.evaluateHandle(($testId) => {
        const element = document.querySelector(`h1[data-test-id='${$testId}']`)
        return !Object.is(element, null)
      }, SandboxTestId.SUSPENSE_FALLBACK_COMPONENT)
      return evaluation.jsonValue()
    }

    const waitForSuspenseToEnd = async (): Promise<void> => {
      await sandbox.waitForSelector(`h1[data-test-id='${COUNTER_VALUE_TEST_ID}']`)
    }

    // Initial state
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(0)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(1)

    // Hydrate by commit
    // - Set arbitary number
    await page.click(`button[data-test-id='${SandboxTestId.button.SET_ARBITARY_VALUE}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.ARBITARY_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(2)
    // - Perform hydration
    await page.click(`button[data-test-id='${SandboxTestId.button.HYDRATE_BY_COMMIT}']`)
    await sandbox.screenshot.checkpoint()
    await expect(isComponentSuspended()).resolves.toBe(true)
    // - Wait for suspense to end
    await waitForSuspenseToEnd()
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.COMMIT_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(3)

    // Hydrate by skip
    // - Set arbitary number
    await page.click(`button[data-test-id='${SandboxTestId.button.SET_ARBITARY_VALUE}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.ARBITARY_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(4)
    // - Perform hydration
    await page.click(`button[data-test-id='${SandboxTestId.button.HYDRATE_BY_SKIP}']`)
    await sandbox.screenshot.checkpoint()
    await expect(isComponentSuspended()).resolves.toBe(true)
    // - Wait for suspense to end
    await waitForSuspenseToEnd()
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.DEFAULT_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(5)

    // Hydrate by commit default
    // - Set arbitary number
    await page.click(`button[data-test-id='${SandboxTestId.button.SET_ARBITARY_VALUE}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.ARBITARY_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(6)
    // - Perform hydration
    await page.click(`button[data-test-id='${SandboxTestId.button.HYDRATE_BY_COMMIT_DEFAULT}']`)
    await sandbox.screenshot.checkpoint()
    await expect(isComponentSuspended()).resolves.toBe(true)
    // - Wait for suspense to end
    await waitForSuspenseToEnd()
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.DEFAULT_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(7)

    // Hydrate by commit noop
    // - Set arbitary number
    await page.click(`button[data-test-id='${SandboxTestId.button.SET_ARBITARY_VALUE}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.ARBITARY_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(8)
    // - Perform hydration
    await page.click(`button[data-test-id='${SandboxTestId.button.HYDRATE_BY_COMMIT_NOOP}']`)
    await sandbox.screenshot.checkpoint()
    await expect(isComponentSuspended()).resolves.toBe(true)
    // - Wait for suspense to end
    await waitForSuspenseToEnd()
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(CounterValues.ARBITARY_VALUE)
    await expect(sandbox.getRenderCount(SandboxTestId.SUB_RENDER_COUNT)).resolves.toBe(9)

    await sandbox.concludeTest()

  })
})
