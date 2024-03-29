import { IS_INTERNAL_DEBUG_ENV } from '../../constants'
import { isObject } from '../../internals/type-checker'
import {
  SHALLOW_COMPARE_INVOCATION_SPY,
  SHALLOW_COMPARE_INVOCATION_TYPE,
} from './internals'

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RELINK_COMPARE_FN_PRESET {

  /**
   * Compares each item in the array using [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   * Use this when your selected state returns an array.
   * @example
   * // Your selector should be something that looks like this:
   * (state) => ([
   *   state.foo,
   *   state.bar,
   * ])
   */
  export function shallowCompareArray(
    prevState: Array<unknown> | unknown,
    nextState: Array<unknown> | unknown,
  ): boolean {

    if (Array.isArray(prevState) && Array.isArray(nextState)) {

      if (prevState.length !== nextState.length) {
        return false // Early exit
      }

      for (let i = 0; i < prevState.length; i++) {
        if (!Object.is(prevState[i], nextState[i])) {
          return false // Early exit
        }
      }

      return true

    } else {
      return Object.is(prevState, nextState) // Fallback
    }


  }

  /**
   * A wrapper around {@link shallowCompareArray} and {@link shallowCompareObject}.
   * Only use this when you cannot determine whether your selected state will
   * return an array or an object as it exhausts additional computing resources
   * that could otherwise be prevented.
   * @example
   * // Your selector might be something that looks like this:
   * (state) => {
   *   if (state.someFlag) {
   *     return [
   *       state.foo,
   *       state.bar,
   *     ]
   *   } else {
   *     return {
   *       baz: state.baz,
   *       baa: state.baa,
   *     }
   *   }
   * }
   */
  export function shallowCompareArrayOrObject(
    prevState: Array<unknown> | unknown,
    nextState: Array<unknown> | unknown,
  ): boolean {

    const prevStateIsArray = Array.isArray(prevState)
    const nextStateIsArray = Array.isArray(nextState)

    // If one is array but the other one is not, consider not equal.
    if (prevStateIsArray !== nextStateIsArray) {
      return false // Early exit
    }

    if (prevStateIsArray && nextStateIsArray) {
      if (IS_INTERNAL_DEBUG_ENV) {
        SHALLOW_COMPARE_INVOCATION_SPY.current = SHALLOW_COMPARE_INVOCATION_TYPE.array
      }
      return shallowCompareArray(prevState, nextState)
    } else {
      if (IS_INTERNAL_DEBUG_ENV) {
        SHALLOW_COMPARE_INVOCATION_SPY.current = SHALLOW_COMPARE_INVOCATION_TYPE.object
      }
      return shallowCompareObject(prevState, nextState)
    }
  }

  /**
   * Compares each item in the object using [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   * Use this when your selected state returns an object.
   * @example
   * // Your selector should be something that looks like this:
   * (state) => ({
   *   foo: state.foo,
   *   bar: state.bar,
   * })
   */
  export function shallowCompareObject(
    prevState: unknown,
    nextState: unknown
  ): boolean {

    if (isObject(prevState) && isObject(nextState)) {

      const prevStateKeys = Object.keys(prevState)
      const nextStateKeys = Object.keys(nextState)

      if (prevStateKeys.length !== nextStateKeys.length) {
        return false // Early exit
      }

      // NOTE: We probably don't need this, if position of the key-value pairs
      // change without the actual keys or values changing, we should still
      // treat it as 'not equal'.
      // const allKeys = [...new Set([...prevStateKeys, ...nextStateKeys])]

      for (let i = 0; i < prevStateKeys.length; i++) {
        const prevStateKey = prevStateKeys[i]
        const nextStateKey = nextStateKeys[i]
        if (prevStateKey !== nextStateKey) {
          return false // Early exit
        }
        if (!Object.is(prevState[prevStateKey], nextState[nextStateKey])) {
          return false // Early exit
        }
      }

      return true

    } else {
      return Object.is(prevState, nextState) // Fallback
    }

  }

  /**
   * Compares the previous and next states with [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).
   */
  export function stringifyCompare(
    prevState: unknown,
    nextState: unknown
  ): boolean {
    return JSON.stringify(prevState) === JSON.stringify(nextState)
  }

}
