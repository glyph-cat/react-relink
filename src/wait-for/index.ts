import { INTERNALS_SYMBOL } from '../constants'
import { RelinkSource } from '../schema'

export function waitForAll(
  // Special case: If put unknown, then there would be errors everywhere else.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: Array<RelinkSource<any>>
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      let readyCount = 0
      for (const source of sources) {
        if (source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
          // If source is already hydrated, no need add watcher
          readyCount += 1
        } else {
          // If not, only then we add a watcher to it
          const unwatch = source[INTERNALS_SYMBOL].M$hydrationWatcher
            .M$watch((isIniting) => {
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
