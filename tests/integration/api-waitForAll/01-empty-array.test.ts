import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: UnitTestConfig): void => {

  const { waitForAll } = Relink

  test('main', async () => {
    const promise = await waitForAll([])
    expect(promise).toBe(undefined)
  })

})
