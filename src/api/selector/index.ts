import { SELECTOR_INTERNAL_SYMBOL } from '../../constants'
import { hasSymbol } from '../../internals/has-symbol'

/**
 * @public
 */
export interface RelinkSelector<S, K> {
  [SELECTOR_INTERNAL_SYMBOL]: {
    M$get(state: S): K
    M$checkBeforeSelect: boolean
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
   * For mutable sources only. Should equality checking be made on the whole
   * state or the value returned by the selector?
   * @defaultValue `false`
   */
  checkBeforeSelect?: boolean
}

const defaultSelectorConfig = {
  M$checkBeforeSelect: false,
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
      M$checkBeforeSelect: config.checkBeforeSelect,
    },
  }
}

export function isRelinkSelector<S, K>(
  value: unknown
): value is RelinkSelector<S, K> {
  return hasSymbol(value, SELECTOR_INTERNAL_SYMBOL)
}
