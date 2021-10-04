import { delay, IntegrationTestProps, TIME_GAP } from '../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, waitForAll } = Relink

  const expectedWaitTime = TIME_GAP(3)
  const gracePeriod = TIME_GAP(5)

  const TEST_METHOD_NAME = 'waitForAll'
  describe(TEST_METHOD_NAME, (): void => {

    test('Normal usage', async (): Promise<void> => {
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
    }, expectedWaitTime + gracePeriod)

    test('Empty array', async (): Promise<void> => {
      await expect(waitForAll([])).resolves.toBe(undefined)
    })

    test('Error handling', async (): Promise<void> => {
      let errObj: Error
      const CorruptedSource = {}
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Ignored on purpose to test incorrect types
        await waitForAll([CorruptedSource])
      } catch (e) {
        errObj = e
      }
      await delay(0)
      expect(errObj instanceof Error).toBe(true)
    })

  })

  function generateSources() {
    const SourceA = createSource({
      key: `test/${TEST_METHOD_NAME}/SourceA`,
      // Total wait time: 1 time gap (because it has no deps)
      default: { inited: false },
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            commit({ inited: true })
          }, TIME_GAP(1))
        },
      },
    })
    const SourceB = createSource({
      // Total wait time: 2 time gaps (because it depends on A)
      key: `test/${TEST_METHOD_NAME}/SourceB`,
      deps: [SourceA],
      default: { inited: false },
      lifecycle: {
        init: async ({ commit }): Promise<void> => {
          setTimeout((): void => {
            commit({ inited: true })
          }, TIME_GAP(1))
        },
      },
    })
    const SourceC = createSource({
      // Total wait time: 3 time gaps (because it depends on A and B)
      key: `test/${TEST_METHOD_NAME}/SourceC`,
      deps: [SourceB],
      default: { inited: false },
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            commit({ inited: true })
          }, TIME_GAP(3))
        },
      },
    })
    const SourceD = createSource({
      // Total wait time: 1 time gap (because it has no deps)
      key: `test/${TEST_METHOD_NAME}/SourceD`,
      default: { inited: false },
      lifecycle: {
        init: async ({ commit }): Promise<void> => {
          setTimeout((): void => {
            commit({ inited: true })
          }, TIME_GAP(1))
        },
      },
    })
    const SourceE = createSource({
      // Total wait time: 0 time gaps (because it has no deps or init method)
      key: `test/${TEST_METHOD_NAME}/SourceE`,
      // This allows us to test if the function will dumbly attach a listener
      // to a source that is already hydrated, because if that's the case,
      // it will result in waiting forever as the listener callback won't be fired.
      default: { inited: true },
    })
    // NOTE: Max wait time is 300ms
    const getArraySnapshot = (): Array<boolean> => [
      SourceA.get().inited,
      SourceB.get().inited,
      SourceC.get().inited,
      SourceD.get().inited,
      SourceE.get().inited,
    ]
    return { SourceA, SourceB, SourceC, SourceD, SourceE, getArraySnapshot }
  }

}
