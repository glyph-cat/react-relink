import { MutableRefObject } from 'react'

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
export const SHALLOW_COMPARE_INVOCATION_SPY: MutableRefObject<SHALLOW_COMPARE_INVOCATION_TYPE> = {
  current: null,
}
