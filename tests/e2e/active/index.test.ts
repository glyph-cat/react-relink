import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('Active', async () => {

    const sandbox = await loadSandbox('active')

    const getCounterValue = async (): Promise<number> => {
      const evaluation = await page.evaluateHandle(() => {
        const element = document.querySelector('h1[data-test-id="counter-value"]')
        return Number(element.innerHTML)
      })
      return evaluation.jsonValue()
    }

    // Initial state
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(0)
    await expect(sandbox.getRenderCount()).resolves.toBe(1)

    // Increase counter, then check value and render count
    await page.click('button[data-test-id="button-increase-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(1)
    await expect(sandbox.getRenderCount()).resolves.toBe(2)

    // Stop listener, then increase counter, then check value and render count
    await page.click('button[data-test-id="button-stop-listening"]')
    await page.click('button[data-test-id="button-increase-counter"]')
    await page.click('button[data-test-id="button-increase-counter"]')
    await page.click('button[data-test-id="button-increase-counter"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(1)
    await expect(sandbox.getRenderCount()).resolves.toBe(3)

    // Start listener, then check value and render count
    await page.click('button[data-test-id="button-start-listening"]')
    await sandbox.screenshot.checkpoint()
    await expect(getCounterValue()).resolves.toBe(4)
    await expect(sandbox.getRenderCount()).resolves.toBe(4)

    await sandbox.concludeTest()

  })
})
