import { delay, TIME_GAP } from '../../../debugging-utils'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, waitFor } = Relink

  jest.useRealTimers()

  let Source: $RelinkSource<number>
  afterEach(async () => {
    await Source.dispose()
  })

  test('Ready to use', async () => {
    Source = new RelinkSource<number>({
      key: 'test/waitFor',
      default: 1,
    })
    expect(Source.get()).toBe(1)
    const promise = await waitFor(Source)
    expect(promise).toBe(undefined)
  })

  test('Needs hydration', async () => {
    Source = new RelinkSource<number>({
      key: 'test/waitFor',
      default: null,
      lifecycle: {
        async init({ commit }) {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })
    const promise = await waitFor(Source)
    expect(promise).toBe(undefined)
    expect(Source.get()).toBe(1)
  })

})
