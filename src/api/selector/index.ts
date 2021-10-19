import { SELECTOR_INTERNAL_SYMBOL } from '../../constants'
import { hasSymbol } from '../../internals/has-symbol'

/**
 * @public
 */
export interface RelinkSelector<S, K> {
  [SELECTOR_INTERNAL_SYMBOL]: {
    M$get(state: S): K
    M$type: 1 | 2
  }
}

/**
 * @public
 */
export interface RelinkSelectorConfig<S, K> {
  /**
   * The actual selector.
   */
  get(state: S): K
  /**
   * Set the selector type control how equality checking is done. Choosing the
   * right type can increase performance optimizations be reducing unnessary
   * re-rendering of components. This only affects **mutable** sources.
   * ---------------------------------------------------------------------------
   * `1`: Equality checking is done on the selected state.
   *
   * Optimized for selectors that look like this:
   * ```js
   * (state) => state.foo
   * ```
   * Since it's just the underlying value that is returned, `Object.is` will
   * return false everytime it compares the unselected state with the previous
   * one, causing components to re-render even when the reference to the
   * selected value remains the same. By performing equality checking on the
   * selected state, it is easier to determine if a re-render is necessary.
   * ---------------------------------------------------------------------------
   * `2`: Equality checking is done on the unselected state.
   *
   * Optimized for selectors that look like this:
   * ```js
   * (state) => ({ foo: state.foo, bar: state.bar })
   * ```
   * Since a new object is returned, `Object.is` will return false every time it
   * compares the selected state with the previous one, causing components to
   * render even when the underlying values are the same. By performing equality
   * checking on the unselected state, it is easier to determine if there is
   * really a state change.
   * ---------------------------------------------------------------------------
   * @defaultValue `1`
   */
  type?: 1 | 2
}

const defaultSelectorConfig = {
  M$type: 1,
} as const

/**
 * @public
 */
export function createSelector<S, K>(
  config: RelinkSelectorConfig<S, K>
): RelinkSelector<S, K> {
  return {
    [SELECTOR_INTERNAL_SYMBOL]: {
      ...defaultSelectorConfig,
      M$get: config.get,
      M$type: config.type,
    },
  }
}

export function isRelinkSelector<S, K>(
  value: unknown
): value is RelinkSelector<S, K> {
  return hasSymbol(value, SELECTOR_INTERNAL_SYMBOL)
}
