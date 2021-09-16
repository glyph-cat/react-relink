import { INTERNALS_SYMBOL } from '../constants'
import { RelinkSource } from '../schema'

/**
 * @public
 */
export function waitForAll(
  // Refer to Special Notes [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: Array<RelinkSource<any>>
): Promise<void> {
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
