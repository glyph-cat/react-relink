import { RelinkSelector, RelinkSource } from '../../schema'
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
  selector: RelinkSelector<S, K>
): [K, RelinkSource<S>['set'], RelinkSource<S>['reset']]

/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): [S | K, RelinkSource<S>['set'], RelinkSource<S>['reset']] {
  const state = useRelinkValue(source, selector)
  return [state, source.set, source.reset]
}
