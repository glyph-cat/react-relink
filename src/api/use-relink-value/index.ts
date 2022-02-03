import { useCallback, useDebugValue } from 'react'
import {
  IS_CLIENT_ENV,
  IS_DEV_ENV,
  SOURCE_INTERNAL_SYMBOL,
} from '../../constants'
import { useLayoutEffect, useState } from '../../internals/custom-hooks'
import { RelinkEvent, RelinkSelector, RelinkSource } from '../../schema'
import { unstable_batchedUpdates } from '../../internals/unstable_batchedUpdates'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'

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

export function useRelinkValue<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): S | K {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  return useRelinkValue_BASE(scopedSource, selector)
}

/**
 * @internal
 */
export function useRelinkValue_BASE<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): S | K {

  // Before anything else, perform suspension if source is not ready.
  useSuspenseForDataFetching(source)

  // NOTE: `isFunction` is not used to check the selector because it can only
  // either be a faulty value or a function. If other types are passed, let
  // the error automatically surface up so that users are aware of the
  // incorrect type.
  const getSelectedState = useCallback((passedState: S): S | K => {
    return selector ? selector(passedState) : passedState
  }, [selector])

  // NOTE: `isFunction` is not used to check the selector because it can only
  // either be a faulty value or a function. If other types are passed, let
  // the error automatically surface up so that users are aware of the
  // incorrect type.
  const [state, setState] = useState(() => getSelectedState(source.get()))

  // Show debug value.
  useDebugValue(undefined, () => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source[SOURCE_INTERNAL_SYMBOL].M$isPublic || IS_DEV_ENV) {
      return {
        key: source[SOURCE_INTERNAL_SYMBOL].M$key,
        selector,
        value: state,
      }
    }
  })

  // Add/remove watcher, compare & trigger update.
  useLayoutEffect((): (() => void) => {
    // NOTE: Virtual batching is implemented at the hook level instead of the
    // source (like it used to in V0) because it used to cause faulty
    // `Source.set()` calls... and also because it just makes more sense.
    let debounceRef: ReturnType<typeof setTimeout>
    const compareAndUpdateRightAway = (event: RelinkEvent<S>): void => {
      unstable_batchedUpdates((): void => {
        setState(getSelectedState(event.state))
      })
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
  }, [getSelectedState, source, state])

  return state
}
