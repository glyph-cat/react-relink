import { INTERNALS_SYMBOL } from '../constants'
import { createDebugLogger, genericDebugLogger } from '../private/debug-logger'
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
      genericDebugLogger.echo('waitForAll starting')
      const isReadyTracker: Record<RelinkSourceKey, true> = {}
      const resolveIfAllAreReady = (): void => {
        if (Object.keys(isReadyTracker).length === deps.length) {
          resolve()
        }
      }
      for (const source of deps) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const debugLogger = createDebugLogger(source[INTERNALS_SYMBOL].M$key)
        if (source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
          // If source is already hydrated, no need add watcher
          isReadyTracker[source[INTERNALS_SYMBOL].M$key] = true
          debugLogger.echo(`waitForAll '${String(source[INTERNALS_SYMBOL].M$key)}' is ready on first check`)
        } else {
          debugLogger.echo(`waitForAll '${String(source[INTERNALS_SYMBOL].M$key)}' is not ready on first check`)
          // If not, only then we add a watcher to it
          const unwatch = source.watch((event): void => {
            // Ignore if event is not caused by hydration
            if (event.type !== RelinkEventType.hydrate) { return }
            debugLogger.echo(`💚 waitForAll received hydration event from ${String(source[INTERNALS_SYMBOL].M$key)} (isHydrating: ${event.isHydrating})`)
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
