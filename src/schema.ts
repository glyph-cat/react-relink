import { SOURCE_INTERNAL_SYMBOL } from './constants'
import { Watcher } from './internals/watcher/schema'

/**
 * Arguments passed to the hydration callback.
 * @public
 */
export interface RelinkHydrateArgs<S> {
  /**
   * Commit a state that was previously saved.
   * @param hydratedState - The previously saved state.
   */
  commit(hydratedState: S): void
  /**
   * Skip hydration and use the default state.
   */
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
 * The event fired when a Relink state is changed by `.set()` or `.reset()`.
 * @public
 */
export interface RelinkStateChangeEvent<S> {
  type: RelinkEventType.set | RelinkEventType.reset
  state: S
}

/**
 * The event fired when a Relink state is changed by `.hydrate()`.
 * @public
 */
export interface RelinkHydrationEvent<S> {
  /**
   * The type of event that was being fired.
   */
  type: RelinkEventType.hydrate
  /**
   * A snapshot of the state.
   */
  state: S
  /**
   * A flag indicating whether the source is hydrating at the time the event is
   * fired.
   */
  isHydrating: boolean
}

/**
 * @public
 */
export type RelinkEvent<S> = RelinkHydrationEvent<S> | RelinkStateChangeEvent<S>

/**
 * @example
 * const UserSource = createSource({
 *   key: 'user-source',
 *   default: defaultUserState,
 *   lifecycle: {
 *     init({ commit, skip }) {
 *       const data = localStorage.getItem('user')
 *       if (data) {
 *         commit(JSON.parse(data))
 *       } else {
 *         skip()
 *       }
 *     },
 *     didSet(payload) {
 *       localStorage.setItem('user', JSON.stringify(payload))
 *     },
 *     didReset() {
 *       localStorage.removeItem('user')
 *     },
 *   },
 * })
 * @public
 */
export interface RelinkLifecycleConfig<S> {
  /**
   * Equivalent of `Source.hydrate()`. But it runs automatically when the source
   * is created and after its dependencies rehydrated (if any).
   */
  init?: RelinkHydrateCallback<S>
  /**
   * Runs when the state changes. You can use this to persist data to a local
   * storage or database.
   */
  didSet?(event: RelinkStateChangeEvent<S>): void
  /**
   * Runs when the state resets. You can use this to remove data from the local
   * storage or database.
   */
  didReset?(event: RelinkStateChangeEvent<S>): void
}

/**
 * @public
 */
export interface RelinkSourceOptions {
  /**
   * ## 🚧 EXPERIMENTAL 🚧
   * This is an experimental feature in React. Further reading: https://reactjs.org/docs/concurrent-mode-suspense.html
   *
   * ---------------------------------------------------------------------------
   *
   * Suspense components that consume this source while it (or any of its
   * dependencies) is(are) hydrating.
   * @defaultValue `false`
   */
  suspense?: boolean
  /**
   * Slightly improve performance by coalescing the "setState" calls on top of
   * React's batched updates.
   * - NOT suitable for states consumed by UI components that need to be
   * responsive. You will notice a delay when typing very quickly, for example.
   * - Suitable for states consumed by UI components that update almost too
   * frequently but actualy doesn't need to re-render that often. For example:
   * a long list discussion threads that updates in real-time.
   * @defaultValue `false`
   */
  virtualBatch?: boolean
  /**
   * Make the state of this source readable through [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) even in production mode. State values will always be readable from the devtools in debug mode.
   * @defaultValue `false`
   */
  public?: boolean
}

/**
 * @public
 */
export type RelinkSourceKey = string | number | symbol

/**
 * @internal
 */
export type RelinkScopeId = number

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
   *
   */
  scope?: RelinkSource<S>
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
  /**
   * A hooks to this source to run certain callbacks when certain events are
   * fired.
   */
  lifecycle?: RelinkLifecycleConfig<S>
  /**
   * Additional options to configure the source.
   */
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
   * ## 🚧  🚧
   * This method might behave differently or be removed in future versions.
   *
   * ---------------------------------------------------------------------------
   *
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
  [SOURCE_INTERNAL_SYMBOL]: {
    M$key: RelinkSourceKey
    M$scopeId: RelinkScopeId
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
    M$getIsReadyStatus(): boolean
  }
}
