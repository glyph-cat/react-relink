import { INTERNALS_SYMBOL } from '../constants'
import { devWarn } from '../private/dev'
import { formatSourceKeyArray } from '../private/string-formatting'
import { isFunction } from '../private/type-checker'
import { RelinkEventType, RelinkSource, RelinkSourceKey } from '../schema'

/**
 * @public
 */
export function waitForAll(
  // Refer to Special Note [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: Array<RelinkSource<any>>
): Promise<void>

/**
 * @public
 */
export function waitForAll(...args: any[]): Promise<void> {
  // Refer to Special Note [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deps: Array<RelinkSource<any>> = args[0] // Deps are aources
  const deprecatedCallback = args[1]
  if (isFunction(deprecatedCallback)) {
    const depsKeyStack: Array<RelinkSourceKey> = []
    for (const dep of deps) {
      depsKeyStack.push(dep[INTERNALS_SYMBOL].M$key)
    }
    devWarn(
      'Starting from V1, `waitForAll` is just an async function, but it seems like you have passed a callback to it, which will do nothing. Instead, use `await waitForAll(...)` or `waitForAll(...).then()`. ' + `You were waiting for these sources: ${formatSourceKeyArray(depsKeyStack)}.`
    )
  }
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
