import {
  MutableRefObject,
  useCallback,
  useDebugValue,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import reactFastCompare from 'react-fast-compare'
import {
  IS_CLIENT_ENV,
  IS_DEV_ENV,
  SOURCE_INTERNAL_SYMBOL,
} from '../../constants'
import {
  forceUpdateReducer,
  useLayoutEffect,
} from '../../internals/custom-hooks'
import { RelinkEvent, RelinkSelector, RelinkSource } from '../../schema'
import { unstable_batchedUpdates } from '../../internals/unstable_batchedUpdates'
import { CallbackWithNoParamAndReturnsVoid } from '../../internals/helper-types'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'

type StateId = Record<string, never>

const stateCache: WeakMap<StateId, unknown> = new WeakMap()

const UNSTABLE_FLAG_shouldSelectBeforeCheck = false

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

  // Before anything else, perform suspension if source is not ready.
  useSuspenseForDataFetching(source)

  // Assign hook ID.
  const hookId: MutableRefObject<StateId> = useRef({})
  useEffect((): (() => void) => {
    const stateId = hookId.current
    return (): void => { stateCache.delete(stateId) }
  }, [])

  const getSelectedState = useCallback((passedState: S): S | K => {
    return selector ? selector(passedState) : passedState
  }, [selector])

  // Assign initial state if not already assigned.
  if (!stateCache.has(hookId.current)) {
    const initialState = getSelectedState(source[SOURCE_INTERNAL_SYMBOL].M$directGet())
    stateCache.set(hookId.current, initialState)
  }

  // Show debug value.
  useDebugValue(undefined, () => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source[SOURCE_INTERNAL_SYMBOL].M$isPublic || IS_DEV_ENV) {
      return {
        key: source[SOURCE_INTERNAL_SYMBOL].M$key,
        selector,
        value: stateCache.get(hookId.current) as S | K,
      }
    }
  })

  // Add/remove watcher, compare & trigger update.
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
  useLayoutEffect((): CallbackWithNoParamAndReturnsVoid => {
    // NOTE: Virtual batching is implemented at the hook level instead of the
    // source (like it used to in V0) because it used to cause faulty
    // `Source.set()` calls... and also because it just makes more sense.
    let debounceRef: ReturnType<typeof setTimeout>
    const compareAndUpdateRightAway = (event: RelinkEvent<S>): void => {
      let newSelectedState: S | K
      let shouldUpdate = false
      const prevCachedState = stateCache.get(hookId.current)
      if (source[SOURCE_INTERNAL_SYMBOL].M$isMutable) {
        if (UNSTABLE_FLAG_shouldSelectBeforeCheck) {
          newSelectedState = getSelectedState(event.state)
          if (!Object.is(prevCachedState, newSelectedState)) {
            shouldUpdate = true
          }
        } else {
          if (!Object.is(prevCachedState, event.state)) {
            newSelectedState = getSelectedState(event.state)
            shouldUpdate = true
          }
        }
      } else {
        // Run selector so that we can deep compare if the selected values
        // are the same.
        newSelectedState = getSelectedState(event.state)
        if (!reactFastCompare(prevCachedState, newSelectedState)) {
          shouldUpdate = true
        }
      }
      if (shouldUpdate) {
        stateCache.set(hookId.current, newSelectedState)
        unstable_batchedUpdates((): void => {
          forceUpdate()
        })
      }
    }
    const compareAndUpdateDebounced = (details: RelinkEvent<S>): void => {
      clearTimeout(debounceRef)
      debounceRef = setTimeout((): void => {
        compareAndUpdateRightAway(details)
      })
    }
    const unwatch = source.watch(
      IS_CLIENT_ENV && source[SOURCE_INTERNAL_SYMBOL].M$isVirtualBatchEnabled
        ? compareAndUpdateDebounced
        : compareAndUpdateRightAway
    )
    return (): void => {
      unwatch()
      clearTimeout(debounceRef)
    }
  }, [getSelectedState, source])

  return stateCache.get(hookId.current) as S | K
}
