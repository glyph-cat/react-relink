import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'

/**
 * Hydrate a source with a previously persisted state. Note that this hydration
 * is completely UNRELATED to server-side rendering.
 * @example
 * const hydrateSource = useHydrateRelinkSource(Source)
 * hydrateSource(({ commit, skip }) => {
 *   const persistedState = custom_method_to_fetch_persisted_state()
 *   if (persistedState) {
 *     commit(persistedState)
 *   } else {
 *     skip()
 *   }
 * })
 * @public
 */
export function useHydrateRelinkSource<State>(
  source: RelinkSource<State>
): RelinkSource<State>['hydrate'] {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  useSuspenseForDataFetching(scopedSource)
  return scopedSource.hydrate
}
