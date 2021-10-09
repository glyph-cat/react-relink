import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSource } from '../../schema'

/**
 * @example
 * const hydrateSource = useHydrateRelinkSource(Source)
 * @public
 */
export function useHydrateRelinkSource<S>(
  source: RelinkSource<S>
): RelinkSource<S>['hydrate'] {
  useSuspenseForDataFetching(source)
  return source.hydrate
}
