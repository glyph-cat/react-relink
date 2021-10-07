import { delay, IntegrationTestProps, TIME_GAP } from '../../../helpers'

// TOFIX: Test failing
// Apparently the watcher callback isn't even invoked at all

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, waitForAll } = Relink
  const testName = 'waitForAll'

  test('Some with deps', async (): Promise<void> => {

    const SourceA_sub1 = createSource<number>({
      key: `test/${testName}/some-with-deps/a/sub-1`,
      default: 0,
      lifecycle: {
        init: ({ commit }) => {
          commit(1)
        },
      },
    })

    const SourceB_sub1 = createSource<number>({
      key: `test/${testName}/some-with-deps/b/sub-1`,
      default: 0,
      lifecycle: {
        init: async ({ commit }) => {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })

    const SourceA = createSource({
      key: `test/${testName}/some-with-deps/a`,
      default: null,
      deps: [SourceA_sub1],
    })

    const SourceB = createSource({
      key: `test/${testName}/some-with-deps/b`,
      default: null,
      deps: [SourceB_sub1],
    })

    const SourceC = createSource({
      key: `test/${testName}/some-with-deps/c`,
      default: null,
    })

    const promise = await waitForAll([SourceA, SourceB, SourceC])
    await delay(TIME_GAP(2))
    expect(promise).toBe(undefined)

    // Cleanup
    SourceA.cleanup()
    SourceA_sub1.cleanup()
    SourceB.cleanup()
    SourceB_sub1.cleanup()
    SourceC.cleanup()

  })

}
