import { CallbackWithNoParamAndReturnsVoid } from '../helper-types'

export type WatcherCallback<A extends Array<unknown>> = (...args: A) => void

export type UnwatchCallback = CallbackWithNoParamAndReturnsVoid

export interface Watcher<A extends Array<unknown>> {
  M$watch(callback: WatcherCallback<A>): UnwatchCallback
  M$unwatchAll(): void
  M$refresh: WatcherCallback<A>
}

/**
 * Creates a Watcher.
 * @example
 * const watcher = createWatcher()
 * const unwatch = watcher.watch(() => { ... })
 * watcher.refresh(...) // Arguments can be passed
 * unwatch()
 * @returns A Watcher object.
 */
export function createWatcher<A extends Array<unknown>>(): Watcher<A> {

  let watcherMap: Record<number, CallableFunction> = {}
  let incrementalWatchId = 1

  const M$watch = (callback: WatcherCallback<A>): UnwatchCallback => {
    const newId = incrementalWatchId++
    watcherMap[newId] = callback
    const unwatch = (): void => {
      delete watcherMap[newId]
    }
    return unwatch
  }

  const M$unwatchAll = (): void => {
    watcherMap = {}
  }

  const M$refresh = (...args: A): void => {
    Object.values(watcherMap).forEach((callback): void => {
      callback(...args)
    })
  }

  return {
    M$watch,
    M$unwatchAll,
    M$refresh,
  }

}
