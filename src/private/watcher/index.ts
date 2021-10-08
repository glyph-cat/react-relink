// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { genericDebugLogger } from '../debug-logger'
import { Watcher, WatcherCallback, UnwatchCallback } from './schema'

/**
 * Creates a Watcher.
 * @example
 * const watcher = createWatcher()
 * const unwatch = watcher.M$watch(() => { ... })
 * watcher.M$refresh(...) // Arguments can be passed
 * unwatch()
 * @returns A Watcher object.
 */
export function createWatcher<A extends Array<unknown>>(): Watcher<A> {

  let watcherCollection: Record<number, CallableFunction> = {}
  let incrementalWatchId = 1

  const M$watch = (callback: WatcherCallback<A>): UnwatchCallback => {
    const newId = incrementalWatchId++
    watcherCollection[newId] = callback
    // genericDebugLogger.echo(`Added watcher (ID: ${newId})`)
    const unwatch = (): void => {
      delete watcherCollection[newId]
      // genericDebugLogger.echo(`Removed watcher (ID: ${newId})`)
    }
    return unwatch
  }

  const M$unwatchAll = (): void => {
    watcherCollection = {}
  }

  const M$refresh = (...args: A): void => {
    // KIV
    const callbackStack = Object.values(watcherCollection)
    // genericDebugLogger.echo(`callbackStack.length: ${callbackStack.length}`)
    for (let i = 0; i < callbackStack.length; i++) {
      callbackStack[i](...args)
    }
    // Object.values(watcherMap).forEach((callback): void => {
    //   callback(...args)
    // })
  }

  return {
    M$watch,
    M$unwatchAll,
    M$refresh,
  }

}
