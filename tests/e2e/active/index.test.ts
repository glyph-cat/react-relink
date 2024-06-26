import { TestId } from '../../../playground/web/sandboxes/active/constants'
import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test.skip('Active', async () => {

    const sandbox = await loadSandbox('active', page)

    // Initial state
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(0)
    await expect(sandbox.getRenderCount()).resolves.toBe(1)

    // Increase counter, then check value and render count
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(1)
    await expect(sandbox.getRenderCount()).resolves.toBe(2)

    // Stop listener, then increase counter, then check value and render count
    await page.click(`button[data-test-id='${TestId.button.STOP_LISTENING}']`)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(1)
    await expect(sandbox.getRenderCount()).resolves.toBe(3)

    // Start listener, then check value and render count
    await page.click(`button[data-test-id='${TestId.button.START_LISTENING}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(4)
    await expect(sandbox.getRenderCount()).resolves.toBe(4)

    await sandbox.concludeTest()

  })
})
