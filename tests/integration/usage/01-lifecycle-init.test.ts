import { RelinkSource } from '../../../src'
import { delay, IntegrationTestConfig, TIME_GAP } from '../../helpers'
import { wrapper } from '../wrapper'

// TOFIX: Possible compile failure

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, RelinkEventType } = Relink

  let Source: RelinkSource<number>
  afterEach((): void => {
    Source.cleanup()
  })

  test('Synchronous init', async (): Promise<void> => {
    Source = createSource({
      key: 'test/Source/lifecycle.init',
      default: null,
      lifecycle: {
        init({ commit }): void {
          commit(1)
        },
      },
    })
    expect(Source.get()).toBe(1)
    expect((await Source.getAsync())).toBe(1)
  })

  test('Asynchronous init', async (): Promise<void> => {
    Source = createSource({
      key: 'test/Source/lifecycle.init',
      default: null,
      lifecycle: {
        async init({ commit }): Promise<void> {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })
    return new Promise(async (resolve) => {
      Source.watch((event) => {
        if (event.type === RelinkEventType.hydrate) {
          resolve() // TOFIX: Never resolves
        }
      })
      expect(Source.get()).toBe(null)
      expect((await Source.getAsync())).toBe(1)
    })
  })

})
