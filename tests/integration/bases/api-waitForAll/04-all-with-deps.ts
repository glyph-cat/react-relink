import { delay, IntegrationTestProps, TIME_GAP } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, waitForAll } = Relink
  const testName = 'waitForAll'

  test('All with deps', async (): Promise<void> => {

    const SourceA_sub1 = createSource<number>({
      key: `test/${testName}/all-with-deps/b/sub-1`,
      default: 0,
      lifecycle: {
        init: ({ commit }) => {
          commit(1)
        },
      },
    })

    const SourceB_sub1 = createSource<number>({
      key: `test/${testName}/all-with-deps/c/sub-1`,
      default: 0,
      lifecycle: {
        init: async ({ commit }) => {
          await delay(TIME_GAP(1))
          commit(1)
        },
      },
    })

    const SourceA = createSource({
      key: `test/${testName}/all-with-deps/b`,
      default: null,
      deps: [SourceA_sub1],
    })

    const SourceB = createSource({
      key: `test/${testName}/all-with-deps/c`,
      default: null,
      deps: [SourceB_sub1],
    })

    const promise = await waitForAll([SourceA, SourceB])
    expect(promise).toBe(undefined)

    // Cleanup
    SourceA.cleanup()
    SourceA_sub1.cleanup()
    SourceB.cleanup()
    SourceB_sub1.cleanup()

  })

}
