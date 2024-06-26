import {
  useCallback,
  useDebugValue,
  useMemo,
  useRef,
} from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { RelinkSelector } from '../../abstractions'
import {
  $$INTERNALS,
  DEFAULT_HOOK_ACTIVE_STATE,
  IS_DEV_ENV,
} from '../../constants'
import { LazyVariable } from '../../internals/lazy-declare'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkAdvancedSelector } from '../selector'
import { RelinkSource } from '../source'

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
  const allowReactiveValues = selector instanceof RelinkAdvancedSelector &&
    selector[$$INTERNALS].M$allowReactiveValues
  const reactiveSelector = allowReactiveValues ? selector : null
  const getSelector = useCallback(() => {
    // NOTE: Value of reactive selector will remain `null` and not trigger
    // component updates if memoizing is not asked for.
    return allowReactiveValues ? reactiveSelector : mutableSelector.current
    // NOTE: `reactiveSelector` and `mutableSelector.current` are essentially
    // the same, but one is specified as a dependency and the other is not.
  }, [reactiveSelector, allowReactiveValues])

  const selectValue = useCallback(($value: State): State | SelectedState => {
    const $selector = getSelector()
    // NOTE: `isFunction` is not used to check the selector because it can only
    // either be a faulty value or a function. If other types are passed, let
    // the error automatically surface up so that users are aware of the
    // incorrect type.
    if ($selector) {
      if ($selector instanceof RelinkAdvancedSelector) {
        return $selector[$$INTERNALS].M$get($value)
      } else {
        return $selector($value)
      }
    } else {
      return $value
    }
  }, [getSelector])

  const isEqual = useMemo(() => {
    const $selector = getSelector()
    return $selector instanceof RelinkAdvancedSelector
      ? $selector[$$INTERNALS].M$compareFn
      : Object.is
  }, [getSelector])

  type ICachedValue = [mutationCount: number, stateValue: State | SelectedState]
  const cachedSyncValue = useRef<SyncValue<ICachedValue>>(INITIAL_STATE_SYNC_VALUE)
  const isLoaded = useRef(false)

  return useSyncExternalStore(
    source.watch,
    useCallback((): SyncValue<ICachedValue> => {
      const [
        currentMutationCount,
        currentSelectedState,
      ] = cachedSyncValue.current[$$INTERNALS]
      const nextMutationCount = source.M$core.M$mutationCount
      const nextSelectedState = new LazyVariable(() => selectValue(source.get()))

      const shouldReturnCachedValue = (() => {
        if (!active && currentMutationCount > INITIAL_STATE_SYNC_VALUE[$$INTERNALS][0]) {
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
        const nextSyncValue: SyncValue<ICachedValue> = {
          [$$INTERNALS]: [nextMutationCount, nextSelectedState.get()],
        }
        cachedSyncValue.current = nextSyncValue
        isLoaded.current = true
        return nextSyncValue
      }
    }, [active, isEqual, selectValue, source]),
    useCallback((): SyncValue<ICachedValue> => {
      // TOFIX: "The result of getServerSnapshot should be cached to avoid an infinite loop"
      // This message is still present
      return { [$$INTERNALS]: [-1, selectValue(source.get())] }
    }, [selectValue, source]),
  )[$$INTERNALS][1]

}
