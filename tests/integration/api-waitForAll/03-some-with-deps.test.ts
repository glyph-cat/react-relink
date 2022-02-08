import { delay, genericDebugLogger, TIME_GAP } from '../../../src/debugging'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, waitForAll } = Relink
  const testName = 'waitForAll'

  test('main', async (): Promise<void> => {

    const SourceA_sub1 = new RelinkSource<number>({
      key: `test/${testName}/some-with-deps/a/sub-1`,
      default: 0,
      lifecycle: {
        init: ({ commit }): void => {
          commit(1)
        },
      },
    })

    const SourceB_sub1 = new RelinkSource<number>({
      key: `test/${testName}/some-with-deps/b/sub-1`,
      default: 0,
      lifecycle: {
        init: async ({ commit }): Promise<void> => {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })

    const SourceA = new RelinkSource({
      key: `test/${testName}/some-with-deps/a`,
      default: null,
      deps: [SourceA_sub1],
    })

    const SourceB = new RelinkSource({
      key: `test/${testName}/some-with-deps/b`,
      default: null,
      deps: [SourceB_sub1],
    })

    const SourceC = new RelinkSource({
      key: `test/${testName}/some-with-deps/c`,
      default: null,
    })

    genericDebugLogger.echo('await delay(TIME_GAP(2))')
    await delay(TIME_GAP(2))

    const promise = await waitForAll([SourceA, SourceB, SourceC])
    expect(promise).toBe(undefined)

    genericDebugLogger.echo('await delay(TIME_GAP(2))')
    await delay(TIME_GAP(2))

    // Cleanup
    SourceA.cleanup()
    SourceA_sub1.cleanup()
    SourceB.cleanup()
    SourceB_sub1.cleanup()
    SourceC.cleanup()

  })

})
