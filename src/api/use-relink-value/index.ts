import { useCallback, useDebugValue } from 'react'
import { $$INTERNALS, IS_CLIENT_ENV, IS_DEV_ENV } from '../../constants'
import { useLayoutEffect, useState } from '../../internals/custom-hooks'
import { RelinkEvent, RelinkSelector } from '../../schema'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'
import { RelinkAdvancedSelector } from '../selector'

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
    if (selector) {
      if (selector instanceof RelinkAdvancedSelector) {
        return selector[$$INTERNALS].M$get(passedState)
      } else {
        return selector(passedState)
      }
    } else {
      return passedState
    }
  }, [selector])

  // NOTE: `isFunction` is not used to check the selector because it can only
  // either be a faulty value or a function. If other types are passed, let
  // the error automatically surface up so that users are aware of the
  // incorrect type.
  const [state, setState] = useState(
    // State initializer
    () => getSelectedState(source.get()),
    // Equality checker
    selector instanceof RelinkAdvancedSelector
      ? selector[$$INTERNALS].M$compareFn
      : Object.is
  )

  // Show debug value.
  useDebugValue(undefined, () => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source.M$options.public || IS_DEV_ENV) {
      return {
        key: source.M$key,
        selector: selector,
        value: state,
      }
    }
  })

  // Add/remove watcher, compare & trigger update.
  useLayoutEffect(() => {
    // NOTE: Virtual batching is implemented at the hook level instead of the
    // source (like it used to in V0) because it used to cause faulty
    // `Source.set()` calls... and also because it just makes more sense.
    let debounceRef: ReturnType<typeof setTimeout>
    const compareAndUpdateRightAway = (event: RelinkEvent<S>): void => {
      setState(getSelectedState(event.state))
    }
    const compareAndUpdateDebounced = (details: RelinkEvent<S>): void => {
      clearTimeout(debounceRef)
      debounceRef = setTimeout((): void => {
        compareAndUpdateRightAway(details)
      })
    }
    const unwatch = source.watch(
      IS_CLIENT_ENV && source.M$options.virtualBatch
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

// /**
//  * @internal
//  */
// export function useRelinkValue_BASE_WITH_SYNC_EXT_STORE<S, K>(
//   source: RelinkSource<S>,
//   selector?: RelinkSelector<S, K>
// ): S | K {

//   // Before anything else, perform suspension if source is not ready.
//   useSuspenseForDataFetching(source)

//   return useSyncExternalStore(source.watch, source.get)

// }
