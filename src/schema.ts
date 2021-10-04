import { INTERNALS_SYMBOL } from './constants'
import { Watcher } from './watcher'

/**
 * @public
 */
export interface RelinkHydrateArgs<S> {
  commit(hydratedState: S): void
  skip(): void
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
export enum RelinkEventType {
  hydrate = 1,
  set,
  reset,
}

/**
 * @public
 */
export interface RelinkStateChangeEvent<S> {
  type: RelinkEventType.set | RelinkEventType.reset
  state: S
}

/**
 * @public
 */
export interface RelinkHydrationEvent<S> {
  type: RelinkEventType.hydrate
  state: S
  isHydrating: boolean
}

/**
 * @public
 */
export type RelinkEvent<S> = RelinkHydrationEvent<S> | RelinkStateChangeEvent<S>

/**
 * @public
 */
export interface RelinkLifecycleConfig<S> {
  init?: RelinkHydrateCallback<S>
  didSet?(event: RelinkStateChangeEvent<S>): void
  didReset?(event: RelinkStateChangeEvent<S>): void
}

/**
 * @public
 */
export interface RelinkSourceOptions {
  /**
   * ## 🚧 EXPERIMENTAL 🚧
   * Suspense while hydrating.
   * @defaultValue `false`
   */
  suspense?: boolean
  /**
   * Make the source mutable.
   * @defaultValue `true`
   */
  mutable?: boolean
  /**
   * Enable virtual batching.
   * @defaultValue `false`
   */
  virtualBatch?: boolean
  /**
   * Make this source accessible through React DevTools even in production mode.
   * @defaultValue `false`
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
  // Refer to Special Note [A] in 'src/index.ts'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: Array<RelinkSource<any>>
  lifecycle?: RelinkLifecycleConfig<S>
  options?: RelinkSourceOptions
}

/**
 * @public
 */
export interface RelinkSource<S> {
  /**
   * Get the current state. This is regardless of whether there are any pending
   * state changes.
   * @example Source.get()
   */
  get(): S
  /**
   * Get the latest state. The state will only be returned after pending state
   * changes have completed. Any further state changes will only be triggered
   * after this promise is resolved.
   * @example await Source.getAsync()
   */
  getAsync(): Promise<S>
  // TODO
  /**
   * ...
   * @example
   */
  set(partialState: S | ((currentState: S) => S | Promise<S>)): Promise<void>
  /**
   * @example Source.reset()
   * @example await Source.reset()
   */
  reset(): Promise<void>
  // TODO
  /**
   * ...
   * @example
   */
  hydrate(callback: RelinkHydrateCallback<S>): void
  /**
   * @example
   * useLayoutEffect(() => {
   *   const unwatch = Source.watch((event) => {
   *     // ...
   *   })
   *   return () => { unwatch() }
   * }, [Source])
   */
  watch: Watcher<[RelinkEvent<S>]>['M$watch']
  /**
   * ## 🚧 Experimental 🚧
   * If sources are dynamically created, it is best to call this
   * cleanup function when they are no longer needed.
   * @example
   * function MyComponent() {
   *   const Source = useRef(null)
   *   if (!Source.current) { Source = createSource(...) }
   *   useEffect(() => {
   *     return () => { Source.current.UNSTABLE_cleanup() }
   *   }, [])
   *   return '...'
   * }
   */
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
    M$suspenseOnHydration(): void
    M$getIsReadyStatus(): boolean
  }
}
