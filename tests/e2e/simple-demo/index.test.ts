import { wrapper } from '../wrapper'

wrapper(({ loadSandbox, screenshotFactory }) => {

  const screenshot = screenshotFactory('simple-demo')

  test('Simple Demo', async () => {
    await loadSandbox('simple-demo')
    await screenshot.snap('temp')
    expect(null).toBe(null)
  })

})
