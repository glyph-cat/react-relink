import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'

/**
 * @example
 * const resetState = useResetRelinkState(Source)
 * @public
 */
export function useResetRelinkState<State>(
  source: RelinkSource<State>
): RelinkSource<State>['reset'] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  useSuspenseForDataFetching(scopedSource)
  return scopedSource.reset
}
