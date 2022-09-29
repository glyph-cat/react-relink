import { LOCAL_HOST } from './constants'

test('Demo', async () => {
  await page.goto(`${LOCAL_HOST}/demo`)
})
