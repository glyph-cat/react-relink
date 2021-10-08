import { CallbackWithNoParamAndReturnsVoid } from '../helper-types'

export type WatcherCallback<A extends Array<unknown>> = (...args: A) => void

export type UnwatchCallback = CallbackWithNoParamAndReturnsVoid

export interface Watcher<A extends Array<unknown>> {
  /**
   * Accepts a callback and start watching for changes. The callback will be
   * invoked whenever a refresh is triggered.
   */
  M$watch(callback: WatcherCallback<A>): UnwatchCallback
  /**
   * Forcecully remove all watchers.
   */
  M$unwatchAll(): void
  /**
   * Triggers a refresh.
   */
  M$refresh: WatcherCallback<A>
}
