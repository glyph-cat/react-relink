import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSource } from '../../schema'

/**
 * @example
 * const resetState = useResetRelinkState(Source)
 * @public
 */
export function useResetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['reset'] {
  useSuspenseForDataFetching(source)
  return source.reset
}
