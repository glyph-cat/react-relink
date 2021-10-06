import { RelinkSource } from '../../../../src'
import {
  delay,
  IntegrationTestProps,
  SampleSchema,
  TIME_GAP,
} from '../../../helpers'

/**
 * Total = 2^4 = 16 sets of tests
 */
interface TestStrategy {
  /**
   * The hydration strategy.
   */
  hydrationStrategy: 'commit' | 'skip',
  /**
   * await Source.hydration(...)
   * ^^^^^
   */
  waitForHydrationPromise: boolean,
  /**
   * The callback passed into `.hydrate(async () => {})`
   *                                    ^^^^^
   */
  isCallbackAsync: boolean,
  /**
   * Refers to `option.suspense`.
   */
  suspense: boolean,
}

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  let Source: RelinkSource<SampleSchema>

  describe('Source.hydrate()', (): void => {

    afterEach((): void => { Source.cleanup() })

    async function baseExecution({
      hydrationStrategy,
      waitForHydrationPromise,
      isCallbackAsync,
      suspense,
    }: TestStrategy): Promise<void> {

      Source = createSource({
        key: 'test/Source.hydrate()',
        default: {
          foo: 1,
          bar: 1,
        },
        options: { suspense },
      })

      const hydrationCallback = ({ commit, skip }) => {
        if (hydrationStrategy === 'commit') {
          commit({ foo: 2, bar: 2 })
        } else {
          skip()
        }
      }

      const hydrationCallbackWithDelay = async ({ commit, skip }) => {
        await delay(TIME_GAP(1))
        if (hydrationStrategy === 'commit') {
          commit({ foo: 2, bar: 2 })
        } else {
          skip()
        }
      }

      const hydrationPromise = Source.hydrate(isCallbackAsync
        ? hydrationCallbackWithDelay
        : hydrationCallback
      )
      if (waitForHydrationPromise) {
        // NOTE: Since we need to await for `hydrationPromise`, we might as well
        // make a check here to confirm the returned/resolved value is none
        // other than `undefined`.
        expect(await hydrationPromise).toBe(undefined)
      } else {
        // NOTE: Even though we don't `await` for `hydrationPromise`, we still
        // use `.getAsync()` below, so there should be enough time for this code
        // to run before the test ends.
        hydrationPromise.then((resolvedHydrationPromise): void => {
          expect(resolvedHydrationPromise).toBe(undefined)
        })
      }
      const expectedOutput = hydrationStrategy === 'commit'
        ? { foo: 2, bar: 2 }
        : { foo: 1, bar: 1 }

      if (
        hydrationStrategy === 'commit' &&
        waitForHydrationPromise === false &&
        isCallbackAsync === true
      ) {
        // KIV: Not sure why state is not changed immediately with this specific
        // set of configs.
        expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
      } else {
        expect(Source.get()).toStrictEqual(expectedOutput)
      }
      expect((await Source.getAsync())).toStrictEqual(expectedOutput)

    }

    const isCallbackAsyncConfigs = [true, false] as const
    const waitForHydrationPromiseConfigs = [true, false] as const
    const hydrationStrategyConfigs = ['commit', 'skip'] as const
    const suspenseConfigs = [true, false] as const

    // We can either write 2 x 2 x 2 x 2 = 16 sets of tests or we can do some
    // Hadouken code like below...
    // https://www.reddit.com/r/ProgrammerHumor/comments/27yykv/indent_hadouken

    for (const isCallbackAsync of isCallbackAsyncConfigs) {
      describe(`isCallbackAsync: ${isCallbackAsync}`, (): void => {
        for (const waitForHydPromise of waitForHydrationPromiseConfigs) {
          describe(`waitForHydrationPromise: ${waitForHydPromise}`, (): void => {
            for (const hydrationStrategy of hydrationStrategyConfigs) {
              describe(`hydrationStrategy: ${hydrationStrategy}`, (): void => {
                for (const suspense of suspenseConfigs) {
                  test(`suspense: ${suspense}`, async (): Promise<void> => {
                    await baseExecution({
                      isCallbackAsync,
                      hydrationStrategy,
                      waitForHydrationPromise: waitForHydPromise,
                      suspense,
                    })
                  })
                }
              })
            }
          })
        }
      })
    }

  })
}
