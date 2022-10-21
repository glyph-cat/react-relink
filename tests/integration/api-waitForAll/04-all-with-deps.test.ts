import { attachRef, createRef, delay, TIME_GAP } from '../../../debugging-utils'
import type { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, waitForAll } = Relink
  const testName = 'waitForAll/all-with-deps'

  jest.useRealTimers()

  test('main', async () => {

    // === Structure ===
    // ├─┬─ Source A ·········· (no data fetching)
    // │ └─── Source A1 ······· (mimics fetch from localStorage)
    // └─┬─ Source B ·········· (no data fetching)
    //   └─── Source B1 ······· (mimics fetch from server)

    const SourceA1_ref = createRef<$RelinkSource<number>>()
    const SourceB1_ref = createRef<$RelinkSource<number>>()

    const SourceA = new RelinkSource({
      key: `test/${testName}/A`,
      default: null,
      deps: [
        attachRef(SourceA1_ref, new RelinkSource<number>({
          key: `test/${testName}/A/1`,
          default: null,
          lifecycle: {
            init: ({ commit }) => {
              commit(1)
            },
          },
        })),
      ],
    })

    const SourceB = new RelinkSource({
      key: `test/${testName}/B`,
      default: null,
      deps: [
        attachRef(SourceB1_ref, new RelinkSource<number>({
          key: `test/${testName}/B/1`,
          default: null,
          lifecycle: {
            init: async ({ commit }) => {
              await delay(TIME_GAP(1))
              commit(1)
            },
          },
        })),
      ],
    })

    await delay(TIME_GAP(2))

    const promise = await waitForAll([SourceA, SourceB])
    expect(promise).toBe(undefined)

    await delay(TIME_GAP(2))

    // Cleanup
    await SourceA.dispose({ force: true })
    await SourceA1_ref.current.dispose({ force: true })
    await SourceB.dispose({ force: true })
    await SourceB1_ref.current.dispose({ force: true })

  })

})
