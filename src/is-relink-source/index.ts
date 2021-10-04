import { INTERNALS_SYMBOL } from '../constants'
import { RelinkSource } from '../schema'

/**
 * @public
 */
export function isRelinkSource<S = unknown>(
  value: unknown
): value is RelinkSource<S> {
  // NOTE: Must do preliminary check. If value is undefined, trying to directly
  // access `value[INTERNALS_SYMBOL]` would've resulted in an error.
  if (!value) { return false } // Early exit
  return typeof value[INTERNALS_SYMBOL] !== 'undefined'
}
