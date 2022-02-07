import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSourceSchema } from '../../schema'
import { useScopedRelinkSource } from '../scope'

/**
 * @example
 * const hydrateSource = useHydrateRelinkSource(Source)
 * @public
 */
export function useHydrateRelinkSource<S>(
  source: RelinkSourceSchema<S>
): RelinkSourceSchema<S>['hydrate'] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  useSuspenseForDataFetching(scopedSource)
  return scopedSource.hydrate
}
