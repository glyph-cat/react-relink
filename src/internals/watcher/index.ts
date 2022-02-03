import { Watcher } from './schema'

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

  // KIV: Consider using a linked list as it is a better representation of how
  // listeners should be added, removed and fired in sequence.
  // The linked list needs to have the following characteristics:
  // * Elements are always added to end of list
  // * Elements can be removed at any position
  let watcherCollection: Record<number, CallableFunction> = {}
  let incrementalWatchId = 1

  const M$watch = (callback: (...args: A) => void): (() => void) => {
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
    const callbackStack = Object.values(watcherCollection)
    for (let i = 0; i < callbackStack.length; i++) {
      callbackStack[i](...args)
    }
    // KIV: Old implementation below
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
