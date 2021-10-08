import { RelinkSource } from '../../schema'

/**
 * @example
 * const resetState = useResetRelinkState(Source)
 * @public
 */
export function useResetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['reset'] {
  // TODO: Suspense on hydrate start
  return source.reset
}
