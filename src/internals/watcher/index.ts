/**
 * Creates a Watcher.
 * @example
 * const watcher = new Watcher()
 * const unwatch = watcher.M$watch(() => { ... })
 * watcher.M$refresh(...) // Arguments can be passed
 * unwatch()
 */
export class Watcher<A extends Array<unknown>> {

  private M$watcherCollection: Record<number, CallableFunction> = {}
  private M$incrementalWatchId = 0

  /**
   * Accepts a callback and start watching for changes. The callback will be
   * invoked whenever a refresh is triggered.
   */
  M$watch = (callback: ((...args: A) => void)): (() => void) => {
    const newId = ++this.M$incrementalWatchId
    this.M$watcherCollection[newId] = callback
    // genericDebugLogger.echo(`Added watcher (ID: ${newId})`)
    const unwatch = (): void => {
      delete this.M$watcherCollection[newId]
      // genericDebugLogger.echo(`Removed watcher (ID: ${newId})`)
    }
    return unwatch
  }

  /**
   * Forcecully remove all watchers.
   */
  M$unwatchAll = (): void => {
    this.M$watcherCollection = {}
  }

  /**
   * Triggers a refresh.
   */
  M$refresh = (...args: A): void => {
    const callbackStack = Object.values(this.M$watcherCollection)
    for (let i = 0; i < callbackStack.length; i++) {
      callbackStack[i](...args)
    }
  }

}
