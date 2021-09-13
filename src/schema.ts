import { INTERNALS_SYMBOL } from './constants'
import { Watcher } from './watcher'

/**
 * @public
 */
export interface RelinkHydrateArgs<S> {
  commit(hydratedState: S): void
}

/**
 * @public
 */
export type RelinkHydrateCallback<S> = (args: RelinkHydrateArgs<S>) => void

export type RelinkHydrator<S> = (callback: RelinkHydrateCallback<S>) => void

/**
 * @public
 */
export type RelinkStateDerivator<S> = ((currentState: S) => S)

/**
 * @public
 */
export type RelinkPartialState<S> = S | RelinkStateDerivator<S>

/**
 * @public
 */
export interface RelinkSetter<S> {
  (partialState: RelinkPartialState<S>): void
}

/**
 * @public
 */
export interface RelinkSelector<S, K> {
  (state: S): K
}

/**
 * @public
 */
export interface RelinkLifecycleConfig<S> {
  init?: RelinkHydrateCallback<S>
  didSet?(details: { state: S }): void
  didReset?(): void
}

/**
 * @public
 */
export interface RelinkSourceOptions {
  suspense?: boolean
  mutable?: boolean
  virtualBatch?: boolean
  public?: boolean
}

export type RelinkSourceKey = string | number

/**
 * @public
 */
export interface RelinkSourceEntry<S> {
  key: RelinkSourceKey
  default: S
  deps?: Array<RelinkSource<any>>
  lifecycle?: RelinkLifecycleConfig<S>
  options?: RelinkSourceOptions
}

/**
 * @public
 */
export interface RelinkSource<S> {
  get(): S
  set: RelinkSetter<S>
  reset(): void
  hydrate: RelinkHydrator<S>
  /**
   * @example
   * const unwatchSource = Source.watch(selfDefinedCallback) // Start watching
   * unwatchSource() // Stop watching
   */
  watch: Watcher<never>['M$watch']
  UNSTABLE_cleanup(): void
  /**
   * @internal
   */
  [INTERNALS_SYMBOL]: {
    M$key: RelinkSourceKey
    M$isMutable: boolean
    M$isPublic: boolean
    M$deps: Array<RelinkSource<unknown>>
    M$directGet(): S
    M$hydrationWatcher: Watcher<[boolean]>
    M$suspenseOnHydration(): void
    M$getIsReadyStatus(): boolean
  }
}
