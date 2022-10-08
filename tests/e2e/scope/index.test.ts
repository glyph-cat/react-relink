import { CSSProperties } from 'react'
import { TileColor } from '../../../playground/web/sandboxes/scope/constants'
import { wrapper } from '../wrapper'

wrapper(({ loadSandbox }) => {
  test('RelinkScope', async () => {

    const sandbox = await loadSandbox('scope')

    const getTileColor = async (testId: string): Promise<string> => {
      const evaluation = await page.evaluateHandle(($testId) => {
        const element = document.querySelector(
          `div[data-test-id="${$testId}"]`
        ) as HTMLDivElement
        if (typeof (element?.getAttribute) === 'function') {
          return element.getAttribute('data-test-value')
        }
        return null
      }, testId)
      return evaluation.jsonValue()
    }

    let MainThemeSourceColor: CSSProperties['color'] = null
    let SubThemeSourceAColor: CSSProperties['color'] = null
    let SubThemeSourceBColor: CSSProperties['color'] = null
    let SubThemeSourceCColor: CSSProperties['color'] = null

    // Initial state
    MainThemeSourceColor = TileColor.red
    SubThemeSourceAColor = TileColor.blue
    SubThemeSourceBColor = TileColor.green
    SubThemeSourceCColor = TileColor.yellow
    await sandbox.screenshot.checkpoint()
    await expect(getTileColor('color-tile-01')).resolves.toBe(MainThemeSourceColor)
    await expect(getTileColor('color-tile-02')).resolves.toBe(SubThemeSourceAColor)
    await expect(getTileColor('color-tile-03')).resolves.toBe(SubThemeSourceBColor)
    await expect(getTileColor('color-tile-04')).resolves.toBe(SubThemeSourceCColor)
    await expect(getTileColor('color-tile-05')).resolves.toBe(MainThemeSourceColor)
    await expect(getTileColor('color-tile-06')).resolves.toBe(SubThemeSourceBColor)

    // Change one of the sources to pink
    MainThemeSourceColor = TileColor.pink
    SubThemeSourceAColor = TileColor.blue
    SubThemeSourceBColor = TileColor.green
    SubThemeSourceCColor = TileColor.yellow
    await page.click('button[data-test-id="button-change-main-theme-color-pink"]')
    await sandbox.screenshot.checkpoint()
    await expect(getTileColor('color-tile-01')).resolves.toBe(MainThemeSourceColor)
    await expect(getTileColor('color-tile-02')).resolves.toBe(SubThemeSourceAColor)
    await expect(getTileColor('color-tile-03')).resolves.toBe(SubThemeSourceBColor)
    await expect(getTileColor('color-tile-04')).resolves.toBe(SubThemeSourceCColor)
    await expect(getTileColor('color-tile-05')).resolves.toBe(MainThemeSourceColor)
    await expect(getTileColor('color-tile-06')).resolves.toBe(SubThemeSourceBColor)

    await sandbox.concludeTest()

  })
})
