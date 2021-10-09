import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSource } from '../../schema'

/**
 * @example
 * const setState = useSetRelinkState(Source)
 * @public
 */
export function useSetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['set'] {
  useSuspenseForDataFetching(source)
  return source.set
}
