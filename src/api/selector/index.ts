import { $$INTERNALS } from '../../constants'

/**
 * @public
 */
export interface RelinkAdvancedSelectorConfig<State, SelectedState> {
  /**
   * The getter of the selected state.
   */
  get(state: State): SelectedState
  /**
   * You can provide a custom equality checker through this property.
   * This function should only return `true` if the previous and next states are
   * considered equal, otherwise it should return `false` .
   * @defaultValue [`Object.is`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
   */
  compareFn?(prevState: SelectedState, nextState: SelectedState): boolean
}

/**
 * @public
 */
export class RelinkAdvancedSelector<State, SelectedState> {

  /**
   * @internal
   */
  [$$INTERNALS]: {
    M$get(state: State): SelectedState
    M$compareFn?(prevState: SelectedState, nextState: SelectedState): boolean
  }

  /**
   * @example
   * // (1 of 3) For primitive data types like booleans, numbers, and strings:
   * import { RelinkAdvancedSelector } from '{:PACKAGE_NAME:}'
   *
   * new RelinkAdvancedSelector({
   *   get(state) {
   *     return state.somePrimitiveProperty // (Eg: 42)
   *   },
   * })
   * @example
   * // (2 of 3) For object property:
   * import { RelinkAdvancedSelector } from '{:PACKAGE_NAME:}'
   *
   * new RelinkAdvancedSelector({
   *   get(state) {
   *     return state.someObjectProperty // (Eg: { hello: 'world' })
   *   },
   * })
   * @example
   * // (3 of 3) For custom object:
   * import { RelinkAdvancedSelector, RELINK_COMPARE_FN_PRESET } from '{:PACKAGE_NAME:}'
   *
   * new RelinkAdvancedSelector({
   *   get(state) {
   *     return {
   *       foo: state.foo, // (Eg: 42)
   *       bar: state.bar, // (Eg: { hello: 'world' })
   *     }
   *   },
   *   compareFn: RELINK_COMPARE_FN_PRESET.shallowCompareObject,
   *   // `RELINK_COMPARE_FN_PRESET.shallowCompareObject` is strongly recommended.
   *   // Comparing the returned object with the default `Object.is` will
   *   // evaluate to `false` every time because a new object is being returned
   *   // each time the selector is executed.
   * })
   */
  constructor({
    get,
    compareFn,
  }: RelinkAdvancedSelectorConfig<State, SelectedState>) {
    this[$$INTERNALS] = {
      M$get: get,
      M$compareFn: compareFn || Object.is,
    }
  }

}
