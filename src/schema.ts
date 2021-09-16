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

/**
 * @public
 */
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
  /**
   * [EXPERIMENTAL] Suspense while hydrating.
   * False by default.
   */
  suspense?: boolean
  /**
   * Make the source mutable.
   * True by default.
   */
  mutable?: boolean
  /**
   * Enable virtual batching.
   * False by default.
   */
  virtualBatch?: boolean
  /**
   * Make this source accessible through React DevTools even in production mode.
   * False by default.
   */
  public?: boolean
}

/**
 * @public
 */
export type RelinkSourceKey = string | number

/**
 * @public
 */
export interface RelinkSourceEntry<S> {
  /**
   * A unique key for the source. Helps make debugging easier and makes
   * dependency checking possible.
   */
  key: RelinkSourceKey
  /**
   * The default state of the source.
   */
  default: S
  /**
   * Wait for other sources to be hydrated before this one does.
   */
  // Refer to Special Notes [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    /**
     * Sources that this one depend on before it can hydrate itself.
     */
    M$parentDeps: Array<RelinkSource<unknown>>
    /**
     * Sources that depend on this one before they can hydrate themselves.
     */
    M$childDeps: Record<RelinkSourceKey, true>
    M$directGet(): S
    M$hydrationWatcher: Watcher<[boolean]>
    M$suspenseOnHydration(): void
    M$getIsReadyStatus(): boolean
  }
}
