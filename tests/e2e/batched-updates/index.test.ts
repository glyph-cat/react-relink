import {
  COUNTER_VALUE_TEST_ID,
} from '../../../playground/web/components/counter-value/constants'
import { TestId } from '../../../playground/web/sandboxes/batched-updates/constants'
import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('Batched Updates', async () => {

    const sandbox = await loadSandbox('batched-updates')

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

    // Strategy: Promise.all
    await page.click(`button[data-test-id='${TestId.button.PROMISE_ALL}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(5)
    await expect(sandbox.getRenderCount()).resolves.toBe(2)

    // Strategy: No await
    await page.click(`button[data-test-id='${TestId.button.WITHOUT_AWAIT}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(10)
    await expect(sandbox.getRenderCount()).resolves.toBe(3)

    // Strategy: Await one by one
    await page.click(`button[data-test-id='${TestId.button.WITH_AWAIT}']`)
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(15)
    await expect(sandbox.getRenderCount()).resolves.toBe(8)

    await sandbox.concludeTest()

  })
})
