import { RelinkSource } from '../../schema'

/**
 * @example
 * const hydrateSource = useHydrateRelinkSource(Source)
 * @public
 */
export function useHydrateRelinkSource<S>(
  source: RelinkSource<S>
): RelinkSource<S>['hydrate'] {
  // TODO: Suspense on hydrate start
  return source.hydrate
}
