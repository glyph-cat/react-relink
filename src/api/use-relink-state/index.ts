import { DEFAULT_HOOK_ACTIVE_STATE } from '../../constants'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
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
 * @returns A tuple containing the selected state, the state setter and a resetter.
 * @public
 */
export function useRelinkState<State, SelectedState>(
  source: RelinkSource<State>,
  selector: RelinkSelector<State, SelectedState>
): [SelectedState, RelinkSource<State>['set'], RelinkSource<State>['reset']]

/**
 * @param source - A {@link RelinkSource}.
 * @param selector - A {@link RelinkSelector}.
 * @param active - Controls whether the hook should listen for state changes and
 * trigger re-renders. Default value is `true`.
 * @example
 * const isActive = true
 * const [filteredState, setState, resetState] = useRelinkState(Source, null, isActive)
 * // If you wish to pass a selector, just replace `null` with the selector that you need.
 * @returns A tuple containing the selected state, the state setter and a resetter.
 * @public
 */
export function useRelinkState<State, SelectedState>(
  source: RelinkSource<State>,
  selector: RelinkSelector<State, SelectedState>,
  active: boolean
): [SelectedState, RelinkSource<State>['set'], RelinkSource<State>['reset']]

/**
 * @internal
 */
export function useRelinkState<State, SelectedState>(
  source: RelinkSource<State>,
  selector?: RelinkSelector<State, SelectedState>,
  active = DEFAULT_HOOK_ACTIVE_STATE
): [State | SelectedState, RelinkSource<State>['set'], RelinkSource<State>['reset']] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  useSuspenseForDataFetching(source)
  const state = useRelinkValue_BASE(scopedSource, selector, active)
  return [state, scopedSource.set, scopedSource.reset]
}
