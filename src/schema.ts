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
export type RelinkSourceKey = string | number | symbol

/**
 * @public
 */
export interface RelinkSourceEntry<S> {
  /**
   * A unique key for the source. Use a string or number for better clarity in a
   * normal project, use a Symbol instead if you're building a library to avoid
   * clashing with user-defined keys.
   */
  key?: RelinkSourceKey
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
  set(partialState: S | ((currentState: S) => S)): Promise<void>
  reset(): Promise<void>
  hydrate(callback: RelinkHydrateCallback<S>): void
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
    M$isVirtualBatchEnabled: boolean
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
