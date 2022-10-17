import {
  COUNTER_VALUE_TEST_ID,
} from '../../../playground/web/components/counter-value/constants'
import { TestId } from '../../../playground/web/sandboxes/active/constants'
import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('Active', async () => {

    const sandbox = await loadSandbox('active', page)

    const getCounterValue = async (): Promise<number> => {
      const evaluation = await page.evaluateHandle(($testId) => {
        const element = document.querySelector(`h1[data-test-id='${$testId}']`)
        return Number(element.innerHTML)
      }, COUNTER_VALUE_TEST_ID)
      return evaluation.jsonValue()
    }

    // Initial state
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(0)
    await expect(sandbox.getRenderCount()).resolves.toBe(1)

    // Increase counter, then check value and render count
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(1)
    await expect(sandbox.getRenderCount()).resolves.toBe(2)

    // Stop listener, then increase counter, then check value and render count
    await page.click(`button[data-test-id='${TestId.button.STOP_LISTENING}']`)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(1)
    await expect(sandbox.getRenderCount()).resolves.toBe(3)

    // Start listener, then check value and render count
    await page.click(`button[data-test-id='${TestId.button.START_LISTENING}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(4)
    await expect(sandbox.getRenderCount()).resolves.toBe(4)

    await sandbox.concludeTest()

  })
})
