import {
  useCallback,
  useDebugValue,
  useMemo,
  useRef, // eslint-disable-line no-restricted-imports
} from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { $$INTERNALS, EMPTY_OBJECT, IS_DEV_ENV } from '../../constants'
import { RelinkSelector } from '../../schema'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'
import { RelinkAdvancedSelector } from '../selector'
import { LazyVariable } from '../../internals/lazy-declare'

/**
 * @param source - A {@link RelinkSource}.
 * @example
 * const state = useRelinkValue(Source)
 * @public
 */
export function useRelinkValue<State>(source: RelinkSource<State>): State

/**
 * @param source - A {@link RelinkSource}.
 * @param selector - A {@link RelinkSelector}.
 * @example
 * const selector = (state) => ({
 *   propertyA: state.propertyA,
 *   propertyB: state.propertyB,
 * })
 * const filteredState = useRelinkValue(Source, selector)
 * @public
 */
export function useRelinkValue<State, SelectedState>(
  source: RelinkSource<State>,
  selector: RelinkSelector<State, SelectedState>
): SelectedState

export function useRelinkValue<State, SelectedState>(
  source: RelinkSource<State>,
  selector?: RelinkSelector<State, SelectedState>
): State | SelectedState {

  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)

  const value = useRelinkValue_BASE(scopedSource, selector)

  // Show debug value.
  useDebugValue(undefined, () => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source.M$options.public || IS_DEV_ENV) {
      return {
        key: source.M$key,
        selector: selector,
        value: value,
      }
    }
  })

  return value
}

// MARK: Internals

/**
 * @internal
 */
const CacheableStateSymbol = Symbol()

/**
 * @internal
 */
interface SyncValue<State> {
  [CacheableStateSymbol]: [number, State]
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_CACHED_SYNC_VALUE: SyncValue<any> = {
  [CacheableStateSymbol]: [-1, EMPTY_OBJECT]
}

/**
 * @internal
 */
export function useRelinkValue_BASE<State, SelectedState>(
  source: RelinkSource<State>,
  selector?: RelinkSelector<State, SelectedState>
): State | SelectedState {

  // Before anything else, perform suspension if source is not ready.
  useSuspenseForDataFetching(source)

  const mutableSelector = useRef(selector)
  mutableSelector.current = selector

  const selectValue = useCallback(($value: State): State | SelectedState => {
    // NOTE: `isFunction` is not used to check the selector because it can only
    // either be a faulty value or a function. If other types are passed, let
    // the error automatically surface up so that users are aware of the
    // incorrect type.
    if (mutableSelector.current) {
      if (mutableSelector.current instanceof RelinkAdvancedSelector) {
        return mutableSelector.current[$$INTERNALS].M$get($value)
      } else {
        return mutableSelector.current($value)
      }
    } else {
      return $value
    }
  }, [])

  const isEqual = useMemo(() => {
    return mutableSelector.current instanceof RelinkAdvancedSelector
      ? mutableSelector.current[$$INTERNALS].M$compareFn
      : Object.is
  }, [])

  const cachedSyncValue = useRef<SyncValue<State | SelectedState>>(EMPTY_CACHED_SYNC_VALUE)

  return useSyncExternalStore(
    source.watch,
    useCallback(() => {
      const [
        currentMutationCount,
        currentSelectedState,
      ] = cachedSyncValue.current[CacheableStateSymbol]
      const nextMutationCount = source.M$core.M$mutationCount
      const nextSelectedState = new LazyVariable(() => selectValue(source.get()))

      const shouldReturnCachedValue = (() => {
        if (currentMutationCount === nextMutationCount) {
          return true // Early exit
        }
        if (Object.is(currentSelectedState, EMPTY_OBJECT)) {
          // If the cached value is `null`, there's no way in hell we're
          // returning that value.
          return false // Early exit
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return isEqual(currentSelectedState, nextSelectedState.get())
      })()

      if (shouldReturnCachedValue) {
        return cachedSyncValue.current
      } else {
        const nextSyncValue: SyncValue<State | SelectedState> = {
          [CacheableStateSymbol]: [nextMutationCount, nextSelectedState.get()],
        }
        cachedSyncValue.current = nextSyncValue
        return nextSyncValue
      }
    }, [isEqual, selectValue, source])
  )[CacheableStateSymbol][1]

}
