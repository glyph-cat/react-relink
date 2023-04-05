import {
  useCallback,
  useDebugValue,
  useMemo,
  useRef,
} from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import {
  $$INTERNALS,
  DEFAULT_HOOK_ACTIVE_STATE,
  IS_DEV_ENV,
} from '../../constants'
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

/**
 * @param source - A {@link RelinkSource}.
 * @param selector - A {@link RelinkSelector}.
 * @param active - Controls whether the hook should listen for state changes and
 * trigger re-renders. The default value is `true`.
 * @example
 * const isActive = true
 * const filteredState = useRelinkValue(Source, null, isActive)
 * // If you wish to pass a selector, just replace `null` with the selector that
 * // you need.
 * @public
 */
export function useRelinkValue<State>(
  source: RelinkSource<State>,
  selector: null,
  active: boolean
): State

/**
 * @param source - A {@link RelinkSource}.
 * @param selector - A {@link RelinkSelector}.
 * @param active - Controls whether the hook should listen for state changes and
 * trigger re-renders. The default value is `true`.
 * @example
 * const isActive = true
 * const selector = (s) => s.someProperty
 * const filteredState = useRelinkValue(Source, selector, isActive)
 * @public
 */
export function useRelinkValue<State, SelectedState>(
  source: RelinkSource<State>,
  selector: RelinkSelector<State, SelectedState>,
  active: boolean
): SelectedState

export function useRelinkValue<State, SelectedState>(
  source: RelinkSource<State>,
  selector?: RelinkSelector<State, SelectedState>,
  active = DEFAULT_HOOK_ACTIVE_STATE
): State | SelectedState {

  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)

  useSuspenseForDataFetching(source)

  const value = useRelinkValue_BASE(scopedSource, selector, active)

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
 * State values are nested in a symbol property so that they are not directly
 * available in the React Dev Tools.
 * @internal
 */
interface SyncValue<T> {
  [$$INTERNALS]: T
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const INITIAL_STATE_SYNC_VALUE: SyncValue<[mutationCount: number, stateValue: any]> = {
  [$$INTERNALS]: [-1, null]
}

/**
 * @internal
 */
export function useRelinkValue_BASE<State, SelectedState>(
  source: RelinkSource<State>,
  selector: RelinkSelector<State, SelectedState>,
  active: boolean
): State | SelectedState {

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

  type CachedValueSchema = [mutationCount: number, stateValue: State | SelectedState]
  const cachedSyncValue = useRef<SyncValue<CachedValueSchema>>(INITIAL_STATE_SYNC_VALUE)
  const isLoaded = useRef(false)

  return useSyncExternalStore(
    source.watch,
    useCallback((): SyncValue<CachedValueSchema> => {
      const [
        currentMutationCount,
        currentSelectedState,
      ] = cachedSyncValue.current[$$INTERNALS]
      const nextMutationCount = source.M$core.M$mutationCount
      const nextSelectedState = new LazyVariable(() => selectValue(source.get()))

      const shouldReturnCachedValue = (() => {
        if (!active) {
          return true // Early exit
        }
        if (currentMutationCount === nextMutationCount) {
          return true // Early exit
        }
        if (!isLoaded.current) {
          // If not loaded, then there is no cached value to begin with
          return false // Early exit
        }

        // KIV: Not sure why TS error is present in editor but not during compilation
        // So `ts-expect-error` cannot be used.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // Argument of type 'State | SelectedState' is not assignable to
        // parameter of type 'SelectedState'. 'SelectedState' could be
        // instantiated with an arbitrary type which could be unrelated to
        // 'State | SelectedState'.ts(2345) This type parameter might need an
        // `extends SelectedState` constraint.
        return isEqual(currentSelectedState, nextSelectedState.get())
      })()

      if (shouldReturnCachedValue) {
        return cachedSyncValue.current
      } else {
        const nextSyncValue: SyncValue<CachedValueSchema> = {
          [$$INTERNALS]: [nextMutationCount, nextSelectedState.get()],
        }
        cachedSyncValue.current = nextSyncValue
        isLoaded.current = true
        return nextSyncValue
      }
    }, [active, isEqual, selectValue, source]),
    (): SyncValue<CachedValueSchema> => ({ [$$INTERNALS]: [-1, selectValue(source.get())] }),
    // KIV: Not sure if this server snapshot implementation is stable in the long run
  )[$$INTERNALS][1]

}
