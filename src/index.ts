import { useDebugValue } from 'react'
import { INTERNALS_SYMBOL, IS_CLIENT_ENV, IS_DEBUG_ENV } from './constants'
import { useLayoutEffect, useState } from './custom-hooks'
import deepCopy from './deep-copy'
import {
  RelinkEvent,
  RelinkEventType,
  RelinkSelector,
  RelinkSource,
  RelinkSourceKey,
} from './schema'
import { isFunction } from './type-checker'
import { unstable_batchedUpdates } from './unstable_batchedUpdates'

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

/**
 * @public
 */
export function useRelinkValue<S>(source: RelinkSource<S>): S
/**
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

  // Wait for suspense
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()

  // Use custom state hook
  const [state, setState, forceUpdate] = useState(
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

  // Add/remove watcher
  useLayoutEffect((): (() => void) => {
    // NOTE: Virtual batching is implemented at the hook level instead of the
    // source because it used to cause faulty `Source.set()` calls.
    let debounceRef: ReturnType<typeof setTimeout>
    const triggerUpdateRightAway = (
      event: RelinkEvent<S>
    ): void => {
      if (event.type === RelinkEventType.hydrate) {
        // Suspense on hydration
        // But take note, we also need to suspense immediately if source is
        // hydrating but component using this hook is rendering
        // May be we should just trigger a force update
        forceUpdate() // KIV
      } else {
        unstable_batchedUpdates(() => {
          setState(getSubsequentState(
            event.state,
            selector,
            source[INTERNALS_SYMBOL].M$isMutable)
          )
        })
      }
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
  }, [forceUpdate, selector, setState, source])

  return state
}

/**
 * @public
 */
export function useRelinkState<S>(
  source: RelinkSource<S>
): [S, RelinkSource<S>['set'], RelinkSource<S>['reset']]
/**
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
 * @public
 */
export function useSetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['set'] {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.set
}

/**
 * @public
 */
export function useResetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSource<S>['reset'] {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.reset
}

/**
 * @public
 */
export function useHydrateRelinkSource<S>(
  source: RelinkSource<S>
): RelinkSource<S>['hydrate'] {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.hydrate
}

// Prevent accidentally exporting internals by explicitly specifying the
// intended exports.
export { VERSION } from './constants'
export { isRelinkSource } from './is-relink-source'
export { createSource } from './source'
export { waitForAll } from './wait-for'
export * from './schema' // Everything in this file is meant to be public.

// === Special Notes ===
// [A] Special case: If unknown is used, there would be errors everywhere else
//     because all sources have some sort of type that just doesn't overlap
//     with unknown.
// [B] (No longer relevant)
//     It seems that in the same `describe` block, if `jest.useRealTimers()` is
//     called, then the remaining test that uses fake timers also need
//     `jest.useFakeTimers()` to be called explicitly.
// [C] (No longer relevant) Not sure why fake timers don't work here...
