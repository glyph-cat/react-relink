import { useDebugValue } from 'react'
import { INTERNALS_SYMBOL, IS_CLIENT_ENV, IS_DEBUG_ENV } from './constants'
import {
  RelinkHydrator,
  RelinkSelector,
  RelinkSetter,
  RelinkSource,
  RelinkSourceKey,
} from './schema'
import { useLayoutEffect, useState } from './custom-hooks'
import deepCopy from './deep-copy'

function getCurrentValue<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
) {
  const currentValue = typeof selector === 'function'
    ? selector(source[INTERNALS_SYMBOL].M$directGet())
    : source[INTERNALS_SYMBOL].M$directGet()
  return source[INTERNALS_SYMBOL].M$isMutable
    ? currentValue
    : deepCopy(currentValue)
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
  const [state, setState] = useState(
    () => getCurrentValue(source, selector),
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
    const triggerUpdateImmediately = (): void => {
      setState(getCurrentValue(source, selector))
    }
    const triggerUpdateDebounced = (): void => {
      clearTimeout(debounceRef)
      debounceRef = setTimeout(triggerUpdateImmediately)
    }
    const unwatch = source.watch(
      IS_CLIENT_ENV && source[INTERNALS_SYMBOL].M$isVirtualBatchEnabled
        ? triggerUpdateDebounced
        : triggerUpdateImmediately
    )
    return (): void => {
      unwatch()
      clearTimeout(debounceRef)
    }
  }, [source, selector])

  return state
}

/**
 * @public
 */
export function useRelinkState<S>(
  source: RelinkSource<S>
): [S, RelinkSetter<S>, () => void]
/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
): [K, RelinkSetter<S>, () => void]
/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): [S | K, RelinkSetter<S>, () => void] {
  const state = useRelinkValue(source, selector)
  return [state, source.set, source.reset]
}

/**
 * @public
 */
export function useSetRelinkState<S>(
  source: RelinkSource<S>
): RelinkSetter<S> {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.set
}

/**
 * @public
 */
export function useResetRelinkState<S>(
  source: RelinkSource<S>
): () => void {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.reset
}

/**
 * @public
 */
export function useRehydrateRelinkSource<S>(
  source: RelinkSource<S>
): RelinkHydrator<S> {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.hydrate
}

export { VERSION } from './constants'
export * from './schema'
export * from './source'
export * from './wait-for'

// === Special Notes ===
// [A] Special case: If unknown is used, there would be errors everywhere else
//     because all sources have some sort of type that just doesn't overlap
//     with unknown.
