import { RelinkSource } from '../../../src'
import { delay, IntegrationTestConfig, TIME_GAP } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, waitFor } = Relink

  let Source: RelinkSource<number>
  afterEach((): void => { Source.cleanup() })

  test('Ready to use', async (): Promise<void> => {
    Source = createSource<number>({
      key: 'test/waitFor',
      default: 1,
    })
    expect(Source.get()).toBe(1)
    const promise = await waitFor(Source)
    expect(promise).toBe(undefined)
  })

  test('Needs hydration', async (): Promise<void> => {
    Source = createSource<number>({
      key: 'test/waitFor',
      default: null,
      lifecycle: {
        async init({ commit }): Promise<void> {
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
