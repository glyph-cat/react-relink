/* eslint-disable @typescript-eslint/no-namespace */
import { MutableRefObject } from 'react'
import { IS_INTERNAL_DEBUG_ENV } from '../../constants'

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
    prevState: Array<unknown>,
    nextState: Array<unknown>
  ): boolean {

    if (IS_INTERNAL_DEBUG_ENV) {
      SHALLOW_COMPARE_INVOCATION_SPY.current.push(
        SHALLOW_COMPARE_INVOCATION_TYPE.array
      )
    }

    if (prevState.length !== nextState.length) {
      return false // Early exit
    }

    for (let i = 0; i < prevState.length; i++) {
      if (!Object.is(prevState[i], nextState[i])) {
        return false // Early exit
      }
    }

    return true

  }

  /**
   * A wrapper around `shallowCompareArray` and `shallowCompareObject`
   * ONLY use this when you cannot determine whether your selected state will
   * return an array or an object as it requires more time to compute.
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
    prevState: Array<unknown> | Record<number | string, unknown>,
    nextState: Array<unknown> | Record<number | string, unknown>,
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
      // @ts-expect-error Not sure why even after checking type with `Array.isArray`
      // TS still emits this error:
      // > Argument of type 'unknown[] | Record<string | number, unknown>' is
      // > not assignable to parameter of type 'Partial<Record<string | number,
      // > unknown>>'.
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
    prevState: Partial<Record<number | string, unknown>>,
    nextState: Partial<Record<number | string, unknown>>
  ): boolean {

    if (IS_INTERNAL_DEBUG_ENV) {
      SHALLOW_COMPARE_INVOCATION_SPY.current.push(
        SHALLOW_COMPARE_INVOCATION_TYPE.object
      )
    }

    const prevStateKeys = Object.keys(prevState)
    const nextStateKeys = Object.keys(nextState)

    if (prevStateKeys.length !== nextStateKeys.length) {
      return false // Early exit
    }

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
