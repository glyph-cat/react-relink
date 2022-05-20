import { RelinkSelector } from '../../schema'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'
import { useRelinkValue_BASE } from '../use-relink-value'

/**
 * @param source - A {@link RelinkSource}.
 * @example
 * const [state, setState, resetState] = useRelinkState(Source)
 * @returns A tuple containing the current state, the state setter and a resetter.
 * @public
 */
export function useRelinkState<State>(
  source: RelinkSource<State>
): [State, RelinkSource<State>['set'], RelinkSource<State>['reset']]

/**
 * @param source - A {@link RelinkSource}.
 * @param selector - A {@link RelinkSelector}.
 * @example
 * const selector = (state) => ({
 *   propertyA: state.propertyA,
 *   propertyB: state.propertyB,
 * })
 * const [filteredState, setState, resetState] = useRelinkState(Source, selector)
 * @returns A tuple containing the current state, the state setter and a resetter.
 * @public
 */
export function useRelinkState<State, SelectedState>(
  source: RelinkSource<State>,
  selector: RelinkSelector<State, SelectedState>
): [SelectedState, RelinkSource<State>['set'], RelinkSource<State>['reset']]

/**
 * @internal
 */
export function useRelinkState<State, SelectedState>(
  source: RelinkSource<State>,
  selector?: RelinkSelector<State, SelectedState>
): [State | SelectedState, RelinkSource<State>['set'], RelinkSource<State>['reset']] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  const state = useRelinkValue_BASE(scopedSource, selector)
  return [state, scopedSource.set, scopedSource.reset]
}
