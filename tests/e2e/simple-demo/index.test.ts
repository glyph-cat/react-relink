import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('Simple Demo', async () => {

    const sandbox = await loadSandbox('simple-demo')

    const getCounterValue = async (): Promise<number> => {
      const evaluation = await page.evaluateHandle(() => {
        const element = document.querySelector('h1[data-test-id="counter-value"]')
        return Number(element.innerHTML)
      })
      return evaluation.jsonValue()
    }

    // NOTE: sessionStorage is read directly using Puppeteer instead of parsing
    // the HTML content because this gives a better representation of the data
    // that we want to test.

    // Initial state
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(0)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(1)

    // Increase counter by 1
    await page.click('button[data-test-id="button-increase-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(1)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('1')
    await expect(sandbox.getRenderCount()).resolves.toBe(2)

    // Increase counter by 1 (again)
    await page.click('button[data-test-id="button-increase-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(2)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('2')
    await expect(sandbox.getRenderCount()).resolves.toBe(3)

    // Set counter to a specific value
    await page.click('button[data-test-id="button-set-counter-42"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(42)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('42')
    await expect(sandbox.getRenderCount()).resolves.toBe(4)

    // Reset counter
    await page.click('button[data-test-id="button-reset-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(0)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(5)

    // Reset counter (again); expect render count to not change
    await page.click('button[data-test-id="button-reset-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(0)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(5)

    // Hydrate counter
    await page.click('button[data-test-id="button-hydrate-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(36)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(6)

    // Hydrate counter (again); expect render count to not change
    await page.click('button[data-test-id="button-hydrate-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(36)
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(6)

    await sandbox.concludeTest()

  })
})
