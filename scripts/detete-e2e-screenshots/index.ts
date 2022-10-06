import * as fs from 'fs'

const BASE_PATH = './tests/e2e'

const dirStack = fs.readdirSync(BASE_PATH)
for (const item of dirStack) {
  if (/\./g.test(item)) { continue }
  const screenshotDirPath = `${BASE_PATH}/${item}/screenshots`
  if (!fs.existsSync(screenshotDirPath)) { continue }
  fs.rmSync(screenshotDirPath, { recursive: true })
}
