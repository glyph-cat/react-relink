import { MutableRefObject } from 'react'
import { IS_INTERNAL_DEBUG_ENV } from '../../constants'
import { isObject } from '../../internals/type-checker'

/**
 * @internal
 */
export enum SHALLOW_COMPARE_INVOCATION_TYPE {
  array = 1,
  object,
}

/**
 * @internal
 */
export const SHALLOW_COMPARE_INVOCATION_SPY: MutableRefObject<Array<SHALLOW_COMPARE_INVOCATION_TYPE>> = {
  current: [],
}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RELINK_COMPARE_FN_PRESET {

  /**
   * Compares each item in the array using `Object.is`.
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

    if (IS_INTERNAL_DEBUG_ENV) {
      SHALLOW_COMPARE_INVOCATION_SPY.current.push(
        SHALLOW_COMPARE_INVOCATION_TYPE.array
      )
    }

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
   * A wrapper around `shallowCompareArray` and `shallowCompareObject`
   * ONLY use this when you cannot determine whether your selected state will
   * return an array or an object as it exhausts a lot of computing resources.
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
      return shallowCompareArray(prevState, nextState)
    } else {
      return shallowCompareObject(prevState, nextState)
    }
  }

  /**
   * Compares each item in the object using `Object.is`.
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

    if (IS_INTERNAL_DEBUG_ENV) {
      SHALLOW_COMPARE_INVOCATION_SPY.current.push(
        SHALLOW_COMPARE_INVOCATION_TYPE.object
      )
    }

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
   * Compares the previous and next states with `JSON.stringify`.
   */
  export function stringifyCompare(
    prevState: unknown,
    nextState: unknown
  ): boolean {
    return JSON.stringify(prevState) === JSON.stringify(nextState)
  }

}
