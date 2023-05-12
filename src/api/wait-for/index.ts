import { RelinkEventType, RelinkSourceKey } from '../../schema'
import { RelinkSource } from '../source'

/**
 * Creates a promise that resolves only when a source has finished hydrating.
 *
 * NOTE: Circular dependencies are not allowed.
 * @param source - The {@link RelinkSource} to wait for.
 * @example
 * // Do something here...
 * await waitForAll([SourceA, SourceB, SourceC])
 * // Continue to do something here...
 * @public
 */
export function waitFor(
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: RelinkSource<any>
): Promise<void> {
  return new Promise((resolve): void => {
    if (source.M$getIsReadyStatus()) {
      resolve()
    } else {
      const unwatch = source.watch((event): void => {
        // Ignore if event is not caused by hydration
        if (event.type !== RelinkEventType.hydrate) { return }
        if (!event.isHydrating) {
          // NOTE: There is no way to unwatch unless the appropriate event is
          // received or unless the source is cleaned up... but then this is
          // what the function is about after all — to wait a source to be ready.
          unwatch()
          resolve()
        }
      })
    }
  })
}

/**
 * Creates a promise that resolves only when a all the listed sources have
 * finished hydrating.
 *
 * NOTE: Circular dependencies are not allowed.
 * @param sources - The array of {@link RelinkSource} to wait for.
 * @example
 * // Do something here...
 * await waitForAll([SourceA, SourceB, SourceC])
 * // Continue to do something here...
 * @public
 */
export function waitForAll(
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: Array<RelinkSource<any>>
): Promise<void> {
  return new Promise((resolve, reject): void => {
    try {
      const isReadyTracker: Record<RelinkSourceKey, true> = {}
      const resolveIfAllAreReady = (): void => {
        if (Object.keys(isReadyTracker).length === sources.length) {
          resolve()
        }
      }
      for (const source of sources) {
        if (source.M$getIsReadyStatus()) {
          // If source is already hydrated, no need add watcher
          isReadyTracker[source.M$key] = true
        } else {
          // If not, only then we add a watcher to it
          const unwatch = source.watch((event): void => {
            // Ignore if event is not caused by hydration
            if (event.type !== RelinkEventType.hydrate) { return }
            if (event.isHydrating) {
              // If a hydrated source suddenly enters hydration again while
              // waiting for other sources to hydrate, remove its key from the
              // tracker.
              delete isReadyTracker[source.M$key]
            } else {
              isReadyTracker[source.M$key] = true
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
