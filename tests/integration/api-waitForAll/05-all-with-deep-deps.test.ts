import { delay } from '@glyph-cat/swiss-army-knife'
import { MutableRefObject } from 'react'
import { attachRef } from '../../../playground/web/utils'
import type { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { TIME_GAP } from '../../../src/debugging'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// NOTE: Basically a stress test

wrapper(({ Relink }: IntegrationTestConfig): void => {

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

    const SourceB1_ref: MutableRefObject<$RelinkSource<number>> = { current: null }
    const SourceB1a_ref: MutableRefObject<$RelinkSource<number>> = { current: null }
    const SourceB1b_ref: MutableRefObject<$RelinkSource<number>> = { current: null }
    const SourceB2_ref: MutableRefObject<$RelinkSource<number>> = { current: null }
    const SourceC1_ref: MutableRefObject<$RelinkSource<number>> = { current: null }
    const SourceC2_ref: MutableRefObject<$RelinkSource<number>> = { current: null }

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
