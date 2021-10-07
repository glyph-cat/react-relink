import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { waitForAll } = Relink

  test('main', async (): Promise<void> => {
    const promise = await waitForAll([])
    expect(promise).toBe(undefined)
  })

})
