import { useCallback, useDebugValue, useReducer } from 'react'
import { INTERNALS_SYMBOL, IS_CLIENT_ENV, IS_DEBUG_ENV } from './constants'
import {
  forceUpdateReducer,
  useLayoutEffect,
  useState,
} from './private/custom-hooks'
import deepCopy from './private/deep-copy'
import {
  RelinkEvent,
  RelinkEventType,
  RelinkSelector,
  RelinkSource,
  RelinkSourceKey,
} from './schema'
import { isFunction } from './private/type-checker'
import { unstable_batchedUpdates } from './private/unstable_batchedUpdates'

function getInitialState<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
) {
  const currentValue = isFunction(selector)
    ? selector(source[INTERNALS_SYMBOL].M$directGet())
    : source[INTERNALS_SYMBOL].M$directGet()
  return source[INTERNALS_SYMBOL].M$isMutable
    ? currentValue
    : deepCopy(currentValue)
}

function getSubsequentState<S, K>(
  state: S,
  selector: RelinkSelector<S, K>,
  isMutable: boolean
) {
  const currentValue = isFunction(selector) ? selector(state) : state
  return isMutable ? currentValue : deepCopy(currentValue)
}

function useSourceWatcher<S = unknown>(
  source: RelinkSource<S>,
  callback: ((event: RelinkEvent<S>) => void)
): void {
  // Add/remove watcher
  useLayoutEffect((): (() => void) => {
    // NOTE: Virtual batching is implemented at the hook level instead of the
    // source because it used to cause faulty `Source.set()` calls.
    let debounceRef: ReturnType<typeof setTimeout>
    const triggerUpdateRightAway = (
      event: RelinkEvent<S>
    ): void => {
      unstable_batchedUpdates(() => {
        callback(event)
      })
    }
    const triggerUpdateDebounced = (
      details: RelinkEvent<S>
    ): void => {
      clearTimeout(debounceRef)
      debounceRef = setTimeout(() => { triggerUpdateRightAway(details) })
    }
    const unwatch = source.watch(
      IS_CLIENT_ENV && source[INTERNALS_SYMBOL].M$isVirtualBatchEnabled
        ? triggerUpdateDebounced
        : triggerUpdateRightAway
    )
    return (): void => {
      unwatch()
      clearTimeout(debounceRef)
    }
  }, [source, callback])
}

function useSuspenseWhenRehydrate<S = unknown>(source: RelinkSource<S>): void {
  // NOTE: `M$suspenseOnHydration` is called at the top level, which means any
  // time the components re-renders, it will be called. If `event.type` is
  // `hydrate`, then only force an update on this hook and the rest should take
  // care of itself.
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
  const sourceWatcherCallback = useCallback((event: RelinkEvent<S>): void => {
    if (event.type === RelinkEventType.hydrate) {
      forceUpdate()
    }
  }, [])
  useSourceWatcher(source, sourceWatcherCallback)
}

/**
 * @example
 * const state = useRelinkValue(Source)
 * @public
 */
export function useRelinkValue<S>(source: RelinkSource<S>): S
/**
 * @example
 * const selector = (state) => ({
 *   propertyA: state.propertyA,
 *   propertyB: state.propertyB,
 * })
 * const filteredState = useRelinkValue(Source, selector)
 * @public
 */
export function useRelinkValue<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
): K
/**
 * @public
 */
export function useRelinkValue<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): S | K {

  useSuspenseWhenRehydrate(source)

  // Use custom state hook
  const [state, setState] = useState(
    () => getInitialState(source, selector),
    source[INTERNALS_SYMBOL].M$isMutable
  )

  // Show debug value
  interface DebugValueReturnType {
    key: RelinkSourceKey
    selector: RelinkSelector<S, K>
    value: S | K
  }
  useDebugValue(undefined, (): DebugValueReturnType => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source[INTERNALS_SYMBOL].M$isPublic || IS_DEBUG_ENV) {
      return {
        key: source[INTERNALS_SYMBOL].M$key,
        selector,
        value: state,
      }
    }
  })

  const sourceWatcherCallback = useCallback((event: RelinkEvent<S>): void => {
    if (event.type !== RelinkEventType.hydrate) {
      setState(getSubsequentState(
        event.state,
        selector,
        source[INTERNALS_SYMBOL].M$isMutable)
      )
    }
  }, [selector, setState, source])
  useSourceWatcher<S>(source, sourceWatcherCallback)

  return state
}

/**
 * @example
 * const [state, setState, resetState] = useRelinkState(Source)
 * @public
 */
export function useRelinkState<S>(
  source: RelinkSource<S>
): [S, RelinkSource<S>['set'], RelinkSource<S>['reset']]
/**
 * @example
 * const selector = (state) => ({
 *   propertyA: state.propertyA,
 *   propertyB: state.propertyB,
 * })
 * const [filteredState, setState, resetState] = useRelinkState(Source, selector)
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
): [K, RelinkSource<S>['set'], RelinkSource<S>['reset']]
/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): [S | K, RelinkSource<S>['set'], RelinkSource<S>['reset']] {
  const state = useRelinkValue(source, selector)
  return [state, source.set, source.reset]
}

/**
 * @example
 * const setState = useSetRelinkState(Source)
 * @public
 */
export function useSetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['set'] {
  useSuspenseWhenRehydrate(source)
  return source.set
}

/**
 * @example
 * const resetState = useResetRelinkState(Source)
 * @public
 */
export function useResetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['reset'] {
  useSuspenseWhenRehydrate(source)
  return source.reset
}

/**
 * @example
 * const hydrateSource = useHydrateRelinkSource(Source)
 * @public
 */
export function useHydrateRelinkSource<S>(
  source: RelinkSource<S>
): RelinkSource<S>['hydrate'] {
  useSuspenseWhenRehydrate(source)
  return source.hydrate
}

export { VERSION } from './constants'
export * from './public/is-relink-source'
export * from './public/source'
export * from './public/wait-for'
export * from './schema'

// === Special Notes ===
// [A] Special case: If unknown is used, there would be errors everywhere else
//     because all sources have some sort of type that just doesn't overlap
//     with unknown.
// [B] In some places '@ts-ignore' is used to test what would happen if the
//     wrong type is provided in a context JavaScript.
