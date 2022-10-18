import { delay } from '../../../debugging-utils'
import { TIME_GAP } from '../../../src/debugging'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, waitForAll } = Relink
  const testName = 'waitForAll/all-with-deps'

  jest.useRealTimers()

  test('main', async () => {

    const SourceA_sub1 = new RelinkSource<number>({
      key: `test/${testName}/a/sub-1`,
      default: 0,
      lifecycle: {
        init: ({ commit }): void => {
          commit(1)
        },
      },
    })

    const SourceB_sub1 = new RelinkSource<number>({
      key: `test/${testName}/b/sub-1`,
      default: 0,
      lifecycle: {
        init: async ({ commit }) => {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })

    const SourceA = new RelinkSource({
      key: `test/${testName}/a`,
      default: null,
      deps: [SourceA_sub1],
    })

    const SourceB = new RelinkSource({
      key: `test/${testName}/b`,
      default: null,
      deps: [SourceB_sub1],
    })

    await delay(TIME_GAP(2))

    const promise = await waitForAll([SourceA, SourceB])
    expect(promise).toBe(undefined)

    await delay(TIME_GAP(2))

    // Cleanup
    await SourceA.dispose({ force: true })
    await SourceA_sub1.dispose({ force: true })
    await SourceB.dispose({ force: true })
    await SourceB_sub1.dispose({ force: true })

  })

})
