import { INTERNALS_SYMBOL } from './constants'
import { Watcher } from './private/watcher/schema'

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
export type RelinkSelector<S, K> = (state: S) => K

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
   * ### ❌ Currently not supported
   * Suspense while hydrating.
   * @defaultValue `false`
   */
  suspense?: boolean // TODO
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
  // Refer to Special Note 'A' in 'src/README.md'
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
  /**
   * Change the value of the state. Note that state values are not always
   * updated immediately, if the next line of code depends on the latest state
   * value, then you should use `await` on this method.
   * @example // Directly set new value (Immediate state change not guaranteed)
   * Source.set(newValue)
   * @example // With reducer (Immediate state change not guaranteed)
   * Source.set((oldValue) => ({ ...oldValue, ...newValue }))
   * @example // With async reducer (Immediate state change not guaranteed)
   * Source.set(async (oldValue) => ({ ...oldValue, ...newValue }))
   * @example // Directly set new value (State change on next line guaranteed)
   * await Source.set(newValue)
   * @example // With reducer (State change on next line guaranteed)
   * await Source.set((oldValue) => ({ ...oldValue, ...newValue }))
   * @example // With async reducer (State change on next line guaranteed)
   * await Source.set(async (oldValue) => ({ ...oldValue, ...newValue }))
   */
  set(partialState: S | ((currentState: S) => S | Promise<S>)): Promise<void>
  /**
   * @example Source.reset() // Immediate state change not guaranteed
   * @example await Source.reset() // State change on next line guaranteed
   */
  reset(): Promise<void>
  /**
   * Rehydrates the source. Useful when you need to fetch data from
   * `localStorage` or a server. This will change the state and cause components
   * to re-render, but won't fire event `lifecycle.didSet` so that the same data
   * doesn't get persisted back to the `localStorage` or server.
   * @example
   * Source.hydrate(({ commit, skip }) => {
   * const rawValue = localStorage.getItem(storageKey)
   *   let parsedValue
   *   try {
   *     parsedValue = JSON.parse(rawValue)
   *   } catch (e) {
   *     console.error(e)
   *   } finally {
   *     if (parsedValue) {
   *       // Conclude the hydration with the persisted data.
   *       commit(parsedValue)
   *     } else {
   *       // Conclude the hydration with the default state.
   *       skip()
   *     }
   *   }
   * })
   */
  hydrate(callback: RelinkHydrateCallback<S>): Promise<void>
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
   *     return () => { Source.current.cleanup() }
   *   }, [])
   *   return '...'
   * }
   */
  cleanup(): void
  /**
   * @internal
   */
  [INTERNALS_SYMBOL]: {
    M$key: RelinkSourceKey
    M$isMutable: boolean
    M$isPublic: boolean
    M$isVirtualBatchEnabled: boolean
    M$isSuspenseEnabled: boolean
    /**
     * Sources that this one depend on before it can hydrate itself.
     */
    M$parentDeps: Array<RelinkSource<unknown>>
    /**
     * Sources that depend on this one before they can hydrate themselves.
     */
    M$childDeps: Record<RelinkSourceKey, true>
    M$directGet(): S
    // M$suspenseOnHydration(): void
    M$getIsReadyStatus(): boolean
  }
}
