import { delay } from '../../__utils__/delay'
import { IntegrationTestProps } from '../constants'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, waitForAll } = Relink

  const expectedWaitTime = 3000 // ms
  const gracePeriod = 1000 // ms

  describe(waitForAll.name, (): void => {

    test('Normal usage', async (): Promise<void> => {
      jest.useRealTimers()
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

    test('Error handling', async (): Promise<void> => {
      jest.useRealTimers()
      let errObj: Error
      const CorruptedSource = {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Ignored on purpose to test incorrect types
      await waitForAll([CorruptedSource]).catch((e) => {
        errObj = e
      })
      await delay(0)
      expect(errObj instanceof Error).toBe(true)
    })

  })

  function generateSources() {
    const SourceA = createSource({
      key: `test/${waitForAll.name}/SourceA`,
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
      key: `test/${waitForAll.name}/SourceB`,
      deps: [SourceA],
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
      key: `test/${waitForAll.name}/SourceC`,
      deps: [SourceB],
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
      key: `test/${waitForAll.name}/SourceD`,
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
      key: `test/${waitForAll.name}/SourceE`,
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
