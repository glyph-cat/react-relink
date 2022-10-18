import { TestId } from '../../../playground/web/sandboxes/simple-demo/constants'
import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('Simple Demo', async () => {

    const sandbox = await loadSandbox('simple-demo', page)

    // NOTE: sessionStorage is read directly using Puppeteer instead of parsing
    // the HTML content because this gives a better representation of the data
    // that we want to test.

    // Initial state
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(0)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(1)

    // Increase counter by 1
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(1)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('1')
    await expect(sandbox.getRenderCount()).resolves.toBe(2)

    // Increase counter by 1 (again)
    await page.click(`button[data-test-id='${TestId.button.INCREASE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(2)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('2')
    await expect(sandbox.getRenderCount()).resolves.toBe(3)

    // Set counter to a specific value
    await page.click(`button[data-test-id='${TestId.button.SET_COUNTER_42}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(42)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('42')
    await expect(sandbox.getRenderCount()).resolves.toBe(4)

    // Reset counter
    await page.click(`button[data-test-id='${TestId.button.RESET_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(0)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(5)

    // Reset counter (again); expect render count to not change
    await page.click(`button[data-test-id='${TestId.button.RESET_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(0)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(5)

    // Hydrate counter
    await page.click(`button[data-test-id='${TestId.button.HYDRATE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(36)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(6)

    // Hydrate counter (again); expect render count to not change
    await page.click(`button[data-test-id='${TestId.button.HYDRATE_COUNTER}']`)
    await sandbox.screenshot.checkpoint()
    await expect(sandbox.commonMethods.getCounterValue()).resolves.toBe(36)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(6)

    await sandbox.concludeTest()

  })
})
