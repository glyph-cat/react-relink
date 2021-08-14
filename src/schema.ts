import { INTERNALS_SYMBOL } from './constants'
import { Watcher } from './watcher'

/**
 * @public
 */
export interface RelinkHydrator<T> {
  (config: HydrationCommitter<T>): void
}

/**
 * @public
 */
export interface RelinkLifecycleConfig<T> {
  init?: RelinkHydrator<T>
  didSet?: (details: { state: T }) => void
  didReset?: () => void
}

/**
 * @public
 */
export interface RelinkSourceOptions {
  suspense?: boolean
  mutable?: boolean
  virtualBatch?: boolean
}

/**
 * @public
 */
export interface RelinkSourceEntry<T> {
  key?: any
  default: T
  deps?: Record<string, RelinkSource<unknown>>,
  lifecycle?: RelinkLifecycleConfig<T>
  options?: RelinkSourceOptions
}

/**
 * @public
 */
export interface RelinkSource<T> {
  get(): T
  set: RelinkSetter<T>
  reset(): void
  hydrate: HydrationCommitter<T>
  /**
   * @example
   * const unwatchSource = Source.watch(selfDefinedCallback) // Start watching
   * unwatchSource() // Stop watching
   */
  watch: Watcher<unknown>['M$watch']
  /**
   * @internal
   */
  [INTERNALS_SYMBOL]: {
    M$suspenseOnHydration(): void
    M$isMutable: boolean
    M$internalId: number
    M$key: string
    M$getIsReadyStatus(): any
  },
}

/**
 * @public
 */
export interface RelinkSetter<T> {
  (newState: T): void
  (callback: (scopedState: T) => T): void
}

/**
 * @public
 */
export interface HydrationCommitter<T> {
  commit: (state: T) => void
}

/**
 * @public
 */
export interface RelinkSelector<T, K> {
  (state: T): K
}
