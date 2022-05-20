import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'

/**
 * @param source - A {@link RelinkSource}.
 * @example
 * const setState = useSetRelinkState(Source)
 * @public
 */
export function useSetRelinkState<State>(
  source: RelinkSource<State>
): RelinkSource<State>['set'] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  useSuspenseForDataFetching(scopedSource)
  return scopedSource.set
}
