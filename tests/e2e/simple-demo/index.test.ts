import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('Simple Demo', async () => {

    const sandbox = await loadSandbox('simple-demo')
    const screenshot = sandbox.screenshotFactory()

    const getCounterValue = async (): Promise<number> => {
      const evaluation = await page.evaluateHandle(() => {
        const element = document.querySelector('h1[data-test-id="counter-value"]')
        return Number(element.innerHTML)
      })
      return evaluation.jsonValue()
    }

    await expect(getCounterValue()).resolves.toBe(0)
    // [Bookmark A]
    // TOFIX: 'counter' is hardcoded
    // TOFIX: Try to automatically parse JSON value, may be always inject an invisible storage viewer in DebugFrame so that it is always readable by Puppeteer
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(1)
    await screenshot.snap('initial-load')

    await page.click('button[data-test-id="button-increase-counter"]')
    await expect(getCounterValue()).resolves.toBe(1)
    // TOFIX: [Bookmark A]
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('1')
    await expect(sandbox.getRenderCount()).resolves.toBe(2)
    await screenshot.snap('plus-1a')

    await page.click('button[data-test-id="button-increase-counter"]')
    await expect(getCounterValue()).resolves.toBe(2)
    // TOFIX: [Bookmark A]
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('2')
    await expect(sandbox.getRenderCount()).resolves.toBe(3)
    await screenshot.snap('plus-1b')

    await page.click('button[data-test-id="button-set-counter-42"]')
    await expect(getCounterValue()).resolves.toBe(42)
    // TOFIX: [Bookmark A]
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe('42')
    await expect(sandbox.getRenderCount()).resolves.toBe(4)
    await screenshot.snap('set-42')

    await page.click('button[data-test-id="button-reset-counter"]')
    await expect(getCounterValue()).resolves.toBe(0)
    // TOFIX: [Bookmark A]
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(5)
    await screenshot.snap('reset')

    await page.click('button[data-test-id="button-hydrate-counter"]')
    await expect(getCounterValue()).resolves.toBe(36)
    // TOFIX: [Bookmark A]
    await expect(sandbox.sessionStorage.getItem('counter')).resolves.toBe(null)
    await expect(sandbox.getRenderCount()).resolves.toBe(6)
    await screenshot.snap('hydrate')

  })
})
