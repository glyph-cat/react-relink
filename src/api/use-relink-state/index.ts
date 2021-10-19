import { RelinkSelector } from '../selector'
import {
  RelinkLegacySelector, // eslint-disable-line import/no-deprecated
  RelinkSource,
} from '../../schema'
import { useRelinkValue } from '../use-relink-value'

/**
 * @example
 * const [state, setState, resetState] = useRelinkState(Source)
 * @public
 */
export function useRelinkState<S>(
  source: RelinkSource<S>
): [S, RelinkSource<S>['set'], RelinkSource<S>['reset']]

/**
 * @example
 * const selector = (state) => ({
 *   propertyA: state.propertyA,
 *   propertyB: state.propertyB,
 * })
 * const [filteredState, setState, resetState] = useRelinkState(Source, selector)
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  // eslint-disable-next-line import/no-deprecated
  selector: RelinkLegacySelector<S, K>
): [K, RelinkSource<S>['set'], RelinkSource<S>['reset']]

/**
 * @example
 * const Selector = createSelector({
 *   get: (state) => ({
 *     propertyA: state.propertyA,
 *     propertyB: state.propertyB,
 *   })
 * })
 * const [filteredState, setState, resetState] = useRelinkState(Source, selector)
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
): [K, RelinkSource<S>['set'], RelinkSource<S>['reset']]

/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  // eslint-disable-next-line import/no-deprecated
  selector?: RelinkSelector<S, K> | RelinkLegacySelector<S, K>
): [S | K, RelinkSource<S>['set'], RelinkSource<S>['reset']] {
  // KIV: The call would have succeeded against this implementation, but
  // implementation signatures of overloads are not externally visible.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const state = useRelinkValue(source, selector)
  return [state, source.set, source.reset]
}
