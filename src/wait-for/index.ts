import { INTERNALS_SYMBOL } from '../constants'
import { devWarn } from '../dev'
import { RelinkSource } from '../schema'

/**
 * @public
 */
export function waitForAll(
  // Refer to Special Notes [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: Array<RelinkSource<any>>
): Promise<void>

/**
 * @public
 */
export function waitForAll(...args: any[]): Promise<void> {
  // Refer to Special Notes [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources: Array<RelinkSource<any>> = args[0]
  const deprecatedCallback = args[1]
  if (typeof deprecatedCallback === 'function') {
    const depsKeyStack = []
    for (const source of sources) {
      depsKeyStack.push(`'${source[INTERNALS_SYMBOL].M$key}'`)
    }
    devWarn(
      'Starting from V1, `waitForAll` is just an async function, but it ' +
      'seems like you have passed a callback to it, which will do nothing. ' +
      'Instead, use `await waitForAll(...)` or `waitForAll(...).then()`. ' +
      `You were waiting for these sources: ${depsKeyStack.join(', ')}`
    )
  }
  return new Promise((resolve, reject): void => {
    try {
      let readyCount = 0
      for (const source of sources) {
        if (source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
          // If source is already hydrated, no need add watcher
          readyCount += 1
        } else {
          // If not, only then we add a watcher to it
          const unwatch = source[INTERNALS_SYMBOL].M$hydrationWatcher
            .M$watch((isIniting): void => {
              if (!isIniting) {
                readyCount += 1
                unwatch()
                if (readyCount === sources.length) {
                  resolve()
                }
              }
            })
        }
      }
    } catch (e) {
      reject(e)
    }
  })
}
