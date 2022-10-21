import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { waitForAll } = Relink

  test('main', async () => {
    const promise = await waitForAll([])
    expect(promise).toBe(undefined)
  })

})
