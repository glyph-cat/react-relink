import { RelinkSelector, RelinkSourceSchema } from '../../schema'
import { useScopedRelinkSource } from '../scope'
import { useRelinkValue_BASE } from '../use-relink-value'

/**
 * @example
 * const [state, setState, resetState] = useRelinkState(Source)
 * @public
 */
export function useRelinkState<S>(
  source: RelinkSourceSchema<S>
): [S, RelinkSourceSchema<S>['set'], RelinkSourceSchema<S>['reset']]

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
  source: RelinkSourceSchema<S>,
  selector: RelinkSelector<S, K>
): [K, RelinkSourceSchema<S>['set'], RelinkSourceSchema<S>['reset']]

/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSourceSchema<S>,
  selector?: RelinkSelector<S, K>
): [S | K, RelinkSourceSchema<S>['set'], RelinkSourceSchema<S>['reset']] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  const state = useRelinkValue_BASE(scopedSource, selector)
  return [state, scopedSource.set, scopedSource.reset]
}
