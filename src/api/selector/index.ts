import { $$INTERNALS } from '../../constants'

/**
 * @public
 */
export interface RelinkAdvancedSelectorConfig<S, K> {
  /**
   * The getter of the selected state.
   */
  get(state: S): K
  /**
   * You can provide a custom equality checker through this property.
   * This function should only return `true` if the previous and next states are
   * considered equal, otherwise it should return `false` .
   * @defaultValue `Object.is`
   */
  compareFn?(prevState: K, nextState: K): boolean
}

/**
 * @public
 */
export class RelinkAdvancedSelector<S, K> {

  /**
   * @internal
   */
  [$$INTERNALS]: {
    M$get(state: S): K
    M$compareFn?(prevState: K, nextState: K): boolean
  }

  constructor({ get, compareFn }: RelinkAdvancedSelectorConfig<S, K>) {
    this[$$INTERNALS] = {
      M$get: get,
      M$compareFn: compareFn || Object.is,
    }
  }

}
