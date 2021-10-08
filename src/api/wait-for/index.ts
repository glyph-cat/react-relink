import { INTERNALS_SYMBOL } from '../../constants'
import { RelinkEventType, RelinkSource, RelinkSourceKey } from '../../schema'

/**
 * Creates a promise that resolves only when a source has finished hydrating.
 */
export function waitFor(
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: RelinkSource<any>
): Promise<void> {
  return new Promise((resolve): void => {
    if (source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
      resolve()
    } else {
      const unwatch = source.watch((event): void => {
        // Ignore if event is not caused by hydration
        if (event.type !== RelinkEventType.hydrate) { return }
        if (!event.isHydrating) {
          // KIV: There's a gotcha - There is no way to unwatch unless the
          // appropriate event is received or unless the source is cleaned up.
          unwatch()
          resolve()
        }
      })
    }
  })
}

/**
 * @public
 */
export function waitForAll(
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: Array<RelinkSource<any>>
): Promise<void> {
  return new Promise((resolve, reject): void => {
    try {
      const isReadyTracker: Record<RelinkSourceKey, true> = {}
      const resolveIfAllAreReady = (): void => {
        if (Object.keys(isReadyTracker).length === deps.length) {
          resolve()
        }
      }
      for (const source of deps) {
        if (source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
          // If source is already hydrated, no need add watcher
          isReadyTracker[source[INTERNALS_SYMBOL].M$key] = true
        } else {
          // If not, only then we add a watcher to it
          const unwatch = source.watch((event): void => {
            // Ignore if event is not caused by hydration
            if (event.type !== RelinkEventType.hydrate) { return }
            if (event.isHydrating) {
              // If a hydrated source suddenly enters hydration again while
              // waiting for other sources to hydrate, remove its key from the
              // tracker.
              delete isReadyTracker[source[INTERNALS_SYMBOL].M$key]
            } else {
              isReadyTracker[source[INTERNALS_SYMBOL].M$key] = true
              unwatch()
              resolveIfAllAreReady()
            }
          })
        }
      }
      resolveIfAllAreReady()
    } catch (e) {
      reject(e)
    }
  })
}
