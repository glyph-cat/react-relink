import { useDebugValue } from 'react'
import { INTERNALS_SYMBOL, IS_DEBUG_ENV } from './constants'
import {
  RelinkHydrator,
  RelinkSelector,
  RelinkSetter,
  RelinkSource,
} from './schema'
import { useLayoutEffect, useState } from './custom-hooks'
import deepCopy from './deep-copy'

// NOTE: For selector behavior >= 1.X.X
// Since React uses Object.is comparison, it will be exhausive to compare deep
// copies of the states, hence direct references are used for selectors.
// When the selected value is finally going to be returned from the hook, only
// then it is deep copied. Although this means deep copy still takes place on
// every render, but by deep-copying only the selected values, we can gain some
// performance boost.

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
  useDebugValue(undefined, () => {
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
  useLayoutEffect(() => {
    const unwatch = source.watch(() => {
      setState(getCurrentValue(source, selector))
    })
    return () => { unwatch() }
  }, [source, selector])

  return state
}

/**
 * @public
 */
export function useRelinkState<S>(source: RelinkSource<S>): [S, RelinkSetter<S>]
/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
): [K, RelinkSetter<S>]
/**
 * @public
 */
export function useRelinkState<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): [S | K, RelinkSetter<S>] {
  const state = useRelinkValue(source, selector)
  return [state, source.set]
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

export * from './schema'
export * from './source'
export * from './wait-for'
