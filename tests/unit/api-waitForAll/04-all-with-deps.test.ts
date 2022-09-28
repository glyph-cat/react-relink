import { delay } from '@glyph-cat/swiss-army-knife'
import { genericDebugLogger, TIME_GAP } from '../../../src/debugging'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, waitForAll } = Relink
  const testName = 'waitForAll'

  test('main', async (): Promise<void> => {

    const SourceA_sub1 = new RelinkSource<number>({
      key: `test/${testName}/all-with-deps/a/sub-1`,
      default: 0,
      lifecycle: {
        init: ({ commit }): void => {
          commit(1)
        },
      },
    })

    const SourceB_sub1 = new RelinkSource<number>({
      key: `test/${testName}/all-with-deps/b/sub-1`,
      default: 0,
      lifecycle: {
        init: async ({ commit }): Promise<void> => {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })

    const SourceA = new RelinkSource({
      key: `test/${testName}/all-with-deps/a`,
      default: null,
      deps: [SourceA_sub1],
    })

    const SourceB = new RelinkSource({
      key: `test/${testName}/all-with-deps/b`,
      default: null,
      deps: [SourceB_sub1],
    })

    genericDebugLogger.echo('await delay(TIME_GAP(2))')
    await delay(TIME_GAP(2))

    const promise = await waitForAll([SourceA, SourceB])
    expect(promise).toBe(undefined)

    genericDebugLogger.echo('await delay(TIME_GAP(2))')
    await delay(TIME_GAP(2))

    // Cleanup
    await SourceA.dispose({ force: true })
    await SourceA_sub1.dispose({ force: true })
    await SourceB.dispose({ force: true })
    await SourceB_sub1.dispose({ force: true })

  })

})
