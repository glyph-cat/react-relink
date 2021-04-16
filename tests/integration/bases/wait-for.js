export default function ({ Relink }) {
  const { createSource, waitForAll } = Relink

  describe('waitForAll', () => {
    const expectedWaitTime = 3000 // ms
    const gracePeriod = 1000 // ms

    it(
      'Callback',
      () => {
        jest.useRealTimers()
        return new Promise((resolve) => {
          const {
            SourceA,
            SourceB,
            SourceC,
            SourceD,
            SourceE,
          } = generateSources()
          expect([
            SourceA.get().inited,
            SourceB.get().inited,
            SourceC.get().inited,
            SourceD.get().inited,
            SourceE.get().inited,
          ]).toStrictEqual([false, false, false, false, false])
          waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE], () => {
            expect([
              SourceA.get().inited,
              SourceB.get().inited,
              SourceC.get().inited,
              SourceD.get().inited,
              SourceE.get().inited,
            ]).toStrictEqual([true, true, true, true, true])
            resolve()
          })
        })
      },
      expectedWaitTime + gracePeriod
    )

    it(
      'Async',
      () => {
        jest.useRealTimers()
        return new Promise((resolve) => {
          (async function () {
            const {
              SourceA,
              SourceB,
              SourceC,
              SourceD,
              SourceE,
            } = generateSources()
            expect([
              SourceA.get().inited,
              SourceB.get().inited,
              SourceC.get().inited,
              SourceD.get().inited,
              SourceE.get().inited,
            ]).toStrictEqual([false, false, false, false, false])
            await waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE])
            expect([
              SourceA.get().inited,
              SourceB.get().inited,
              SourceC.get().inited,
              SourceD.get().inited,
              SourceE.get().inited,
            ]).toStrictEqual([true, true, true, true, true])
            resolve()
          })()
        })
      },
      expectedWaitTime + gracePeriod
    )

    describe('Error handling', () => {
      it('Callback', () => {
        jest.useRealTimers()
        return new Promise((resolve) => {
          let errObj
          const CorruptedSource = {}
          waitForAll(
            [CorruptedSource],
            () => {},
            (e) => {
              errObj = e
            }
          )
          setTimeout(() => {
            expect(errObj instanceof Error).toBe(true)
            resolve()
          })
        })
      })

      it('Async', () => {
        jest.useRealTimers()
        return new Promise((resolve) => {
          (async () => {
            let errObj
            const CorruptedSource = {}
            await waitForAll([CorruptedSource]).catch((e) => {
              errObj = e
            })
            setTimeout(() => {
              expect(errObj instanceof Error).toBe(true)
              resolve()
            })
          })()
        })
      })
    })
  })

  function generateSources() {
    const SourceA = createSource({
      // Total wait time: 500ms
      default: { inited: false },
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 500)
        },
      },
    })
    const SourceB = createSource({
      // Total wait time: 1500ms (because it depends on A)
      deps: { SourceA },
      default: { inited: false },
      lifecycle: {
        init: async ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 1000)
        },
      },
    })
    const SourceC = createSource({
      // Total wait time: 3000ms (because it depends on A and B)
      deps: { SourceB },
      default: { inited: false },
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 1500)
        },
      },
    })
    const SourceD = createSource({
      // Total wait time: 500ms
      default: { inited: false },
      lifecycle: {
        init: async ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 500)
        },
      },
    })
    const SourceE = createSource({
      // Total wait time: 1000ms
      default: { inited: false },
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 1000)
        },
      },
    })
    // NOTE: Max wait time is 3000ms
    return { SourceA, SourceB, SourceC, SourceD, SourceE }
  }
}
