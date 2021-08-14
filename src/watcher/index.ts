export type WatcherCallback<P> = (...args: Array<P>) => void

export type UnwatchCallback = () => void

export interface Watcher<P> {
  M$watch(callback: WatcherCallback<P>): UnwatchCallback
  M$refresh: WatcherCallback<P>
}

/**
 * Creates a Watcher.
 * @returns A Watcher object.
 * @example
 * const watcher = createWatcher()
 *
 * const unwatch = watcher.watch(() => { ... })
 *
 * // Arguments (if provided) will be passed to all subscribed callbacks
 * watcher.refresh(...)
 *
 * unwatch()
 */
export function createWatcher<P>(): Watcher<P> {

  const watcherMap: Map<number, CallableFunction> = new Map()
  let incrementalWatchId = 1

  function M$watch(callback: WatcherCallback<P>): UnwatchCallback {
    const newId = incrementalWatchId++
    watcherMap.set(newId, callback)
    const unwatch = (): void => {
      watcherMap.delete(newId)
    }
    return unwatch
  }

  function M$refresh(...args: Array<P>): void {
    watcherMap.forEach((callback) => {
      callback(...args)
    })
  }

  return {
    M$watch,
    M$refresh,
  }

}
