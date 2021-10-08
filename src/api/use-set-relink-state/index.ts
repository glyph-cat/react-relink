import { RelinkSource } from '../../schema'

/**
 * @example
 * const setState = useSetRelinkState(Source)
 * @public
 */
export function useSetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['set'] {
  // TODO: Suspense on hydrate start
  return source.set
}
