import { attachRef, createRef, delay, TIME_GAP } from '../../../debugging-utils'
import type { RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// NOTE: Basically a stress test

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, waitForAll } = Relink
  const sharedTestKeyFragment = 'waitForAll/all-with-deep-deps'

  jest.useRealTimers()

  test('main', async () => {

    // === Structure ===
    // ├─── Source A ·········· (no deps, no data fetching)
    // ├─┬─ Source B ·········· (mimics fetch from localStorage)
    // │ ├─┬─ Source B1 ······· (mimics fetch from localStorage)
    // │ │ ├─── Source B1/a ··· (mimics fetch from localStorage)
    // │ │ └─── Source B1/b ··· (mimics fetch from server)
    // │ └─── Source B2 ······· (mimics fetch from server)
    // └─┬─ Source C ·········· (mimics fetch from server)
    //   ├─── Source C1 ······· (mimics fetch from localStorage)
    //   └─── Source C2 ······· (mimics fetch from server)

    const SourceB1_ref = createRef<RelinkSource<number>>()
    const SourceB1a_ref = createRef<RelinkSource<number>>()
    const SourceB1b_ref = createRef<RelinkSource<number>>()
    const SourceB2_ref = createRef<RelinkSource<number>>()
    const SourceC1_ref = createRef<RelinkSource<number>>()
    const SourceC2_ref = createRef<RelinkSource<number>>()

    const SourceA = new RelinkSource({
      key: `test/${sharedTestKeyFragment}/A`,
      default: null,
    })

    const SourceB = new RelinkSource({
      key: `test/${sharedTestKeyFragment}/B`,
      default: null,
      lifecycle: {
        init({ commit }) {
          commit(1)
        },
      },
      deps: [
        attachRef(SourceB1_ref, new RelinkSource({
          key: `test/${sharedTestKeyFragment}/B/1`,
          default: null,
          lifecycle: {
            init({ commit }) {
              commit(1)
            },
          },
          deps: [
            attachRef(SourceB1a_ref, new RelinkSource({
              key: `test/${sharedTestKeyFragment}/B/1/a`,
              default: null,
              lifecycle: {
                init({ commit }) {
                  commit(1)
                },
              },
            })),
            attachRef(SourceB1b_ref, new RelinkSource({
              key: `test/${sharedTestKeyFragment}/B/1/b`,
              default: null,
              lifecycle: {
                async init({ commit }) {
                  await delay(TIME_GAP(1))
                  commit(1)
                },
              },
            })),
          ],
        })),
        attachRef(SourceB2_ref, new RelinkSource({
          key: `test/${sharedTestKeyFragment}/B/2`,
          default: null,
          lifecycle: {
            async init({ commit }) {
              await delay(TIME_GAP(1))
              commit(1)
            },
          },
        })),
      ],
    })

    const SourceC = new RelinkSource({
      key: `test/${sharedTestKeyFragment}/C`,
      default: null,
      lifecycle: {
        async init({ commit }) {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
      deps: [
        attachRef(SourceC1_ref, new RelinkSource({
          key: `test/${sharedTestKeyFragment}/C/1`,
          default: null,
          lifecycle: {
            init({ commit }) {
              commit(1)
            },
          },
        })),
        attachRef(SourceC2_ref, new RelinkSource({
          key: `test/${sharedTestKeyFragment}/C/2`,
          default: null,
          lifecycle: {
            async init({ commit }) {
              await delay(TIME_GAP(1))
              commit(1)
            },
          },
        })),
      ],
    })

    await delay(TIME_GAP(3))

    const promise = await waitForAll([SourceA, SourceB, SourceC])
    expect(promise).toBe(undefined)

    await delay(TIME_GAP(3))

    // Cleanup
    await SourceA.dispose({ force: true })
    await SourceB.dispose({ force: true })
    await SourceB2_ref.current.dispose({ force: true })
    await SourceB1_ref.current.dispose({ force: true })
    await SourceB1a_ref.current.dispose({ force: true })
    await SourceB1b_ref.current.dispose({ force: true })
    await SourceC.dispose({ force: true })
    await SourceC1_ref.current.dispose({ force: true })
    await SourceC2_ref.current.dispose({ force: true })

  })

})
