import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSource } from '../../schema'
import { useScopedRelinkSource } from '../scope'

/**
 * @example
 * const hydrateSource = useHydrateRelinkSource(Source)
 * @public
 */
export function useHydrateRelinkSource<S>(
  source: RelinkSource<S>
): RelinkSource<S>['hydrate'] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  useSuspenseForDataFetching(scopedSource)
  return scopedSource.hydrate
}
