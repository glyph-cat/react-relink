import { RelinkAdvancedSelector } from './api/selector'

/**
 * Arguments passed to the hydration callback.
 * @public
 */
export interface RelinkHydrateArgs<State> {
  /**
   * Commit a state that was previously saved.
   * @param hydratedState - The previously saved state.
   */
  commit(hydratedState: State): void
  /**
   * Skip hydration and use the default state.
   */
  skip(): void
}

/**
 * @public
 */
export type RelinkHydrateCallback<State> = (args: RelinkHydrateArgs<State>) => void

/**
 * @public
 */
export type RelinkSelector<State, K> = RelinkBasicSelector<State, K> | RelinkAdvancedSelector<State, K>

/**
 * @public
 */
export type RelinkBasicSelector<State, K> = (state: State) => K

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
export interface RelinkStateChangeEvent<State> {
  type: RelinkEventType.set | RelinkEventType.reset
  state: State
}

/**
 * The event fired when a Relink state is changed by `.hydrate()`.
 * @public
 */
export interface RelinkHydrationEvent<State> {
  /**
   * The type of event that was being fired.
   */
  type: RelinkEventType.hydrate
  /**
   * A snapshot of the state.
   */
  state: State
  /**
   * A flag indicating whether the source is hydrating at the time the event is
   * fired.
   */
  isHydrating: boolean
}

/**
 * @public
 */
export type RelinkEvent<State> = RelinkHydrationEvent<State> | RelinkStateChangeEvent<State>

/**
 * @example
 * const UserSource = new RelinkSource({
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
export interface RelinkLifecycleConfig<State> {
  /**
   * Equivalent of `Source.hydrate()`. But it runs automatically when the source
   * is created and after its dependencies rehydrated (if any).
   */
  init?: RelinkHydrateCallback<State>
  /**
   * Runs when the state changes. You can use this to persist data to a local
   * storage or database.
   */
  didSet?(event: RelinkStateChangeEvent<State>): void
  /**
   * Runs when the state resets. You can use this to remove data from the local
   * storage or database.
   */
  didReset?(event: RelinkStateChangeEvent<State>): void
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
   * ## 🚨 DEPRECATED 🚨
   * Slightly improve performance by coalescing the "setState" calls on top of
   * React's batched updates.
   * - NOT suitable for states consumed by UI components that need to be
   * responsive. You will notice a delay when typing very quickly, for example.
   * - Suitable for states consumed by UI components that update almost too
   * frequently but actualy doesn't need to re-render that often. For example:
   * a long list discussion threads that updates in real-time.
   * @defaultValue `false`
   * @deprecated React's concurrent rendering solves this problem already.
   * For less significant UI updates, use the
   * [Transition](https://reactjs.org/docs/hooks-reference.html#usetransition)
   * API instead. For urgent UI updates, call the `.set()` method on sources as
   * usual.
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
