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
            getArraySnapshot,
          } = generateSources()
          expect(getArraySnapshot()).toStrictEqual([
            false,
            false,
            false,
            false,
            true,
          ])
          waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE], () => {
            expect(getArraySnapshot()).toStrictEqual([
              true,
              true,
              true,
              true,
              true,
            ])
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
              getArraySnapshot,
            } = generateSources()
            expect(getArraySnapshot()).toStrictEqual([
              false,
              false,
              false,
              false,
              true,
            ])
            await waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE])
            expect(getArraySnapshot()).toStrictEqual([
              true,
              true,
              true,
              true,
              true,
            ])
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
      // Total wait time: 100ms
      default: { inited: false },
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 100)
        },
      },
    })
    const SourceB = createSource({
      // Total wait time: 200ms (because it depends on A)
      deps: { SourceA },
      default: { inited: false },
      lifecycle: {
        init: async ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 100)
        },
      },
    })
    const SourceC = createSource({
      // Total wait time: 300ms (because it depends on A and B)
      deps: { SourceB },
      default: { inited: false },
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 1000)
        },
      },
    })
    const SourceD = createSource({
      // Total wait time: 100ms
      default: { inited: false },
      lifecycle: {
        init: async ({ commit }) => {
          setTimeout(() => {
            commit({ inited: true })
          }, 100)
        },
      },
    })
    const SourceE = createSource({
      // Total wait time: (Should be) 0ms
      // This allows us to test if the function will dumbly attach a listener
      // to a source that is already hydrated, because if that's the case,
      // it will result in waiting forever as the listener callback won't be fired.
      default: { inited: true },
    })
    // NOTE: Max wait time is 300ms
    const getArraySnapshot = () => [
      SourceA.get().inited,
      SourceB.get().inited,
      SourceC.get().inited,
      SourceD.get().inited,
      SourceE.get().inited,
    ]
    return { SourceA, SourceB, SourceC, SourceD, SourceE, getArraySnapshot }
  }
}
