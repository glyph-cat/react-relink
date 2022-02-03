/**
 * @internal
 */
export interface Watcher<A extends Array<unknown>> {
  /**
   * Accepts a callback and start watching for changes. The callback will be
   * invoked whenever a refresh is triggered.
   */
  M$watch(callback: ((...args: A) => void)): (() => void)
  /**
   * Forcecully remove all watchers.
   */
  M$unwatchAll(): void
  /**
   * Triggers a refresh.
   */
  M$refresh(...args: A): void
}
