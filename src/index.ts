import { useDebugValue, useMemo, useReducer } from 'react'
import { INTERNALS_SYMBOL, IS_DEBUG_ENV } from './constants'
import { createEqualityChecker } from './equality'
import { forceUpdateReducer } from './force-update'
import { RelinkSelector, RelinkSource } from './schema'
import useLayoutEffect from './use-isomorphic-layout-effect'

// NOTE: For selector behavior >= 1.X.X
// Since React uses Object.is comparison, it will be exhausive to compare deep copies
// of the states, hence direct references are used for selectors.
// When the selected value is finally going to be returned from the hook, only then
// it is deep copied. Although this means deep copy still takes place on every render,
// but by deep-copying only the selected values, we can gain some performance boost

function getCurrentValue<T, K>(
  source: RelinkSource<T>,
  selector: RelinkSelector<T, K>
) {
  const currentValue =
    typeof selector === 'function' ? selector(source.get()) : source.get()
  return currentValue
}

export function useRelinkValue<T>(
  source: RelinkSource<T>,
  selector
) {

  source[INTERNALS_SYMBOL].M$suspenseOnHydration()

  const currentValue = getCurrentValue(source, selector)

  const isEqual = useMemo(() => {
    return createEqualityChecker(source[INTERNALS_SYMBOL].M$isMutable)
  }, [source[INTERNALS_SYMBOL].M$isMutable])

  if (IS_DEBUG_ENV) {
    // (Exception) Because `IS_DEBUG_ENV` is a build-time constant
    useDebugValue(undefined, () => ({
      key: source[INTERNALS_SYMBOL].M$key || '(Unnamed)',
      selector,
      value: currentValue,
    }))
  }

  // Custom force update method is used instead of `useReducer` or `useState`
  // because otherwise this would expose sensitive data store in the source
  // through React dev tools.
  const [, forceUpdate] = useReducer(forceUpdateReducer, {})

  useLayoutEffect(() => {
    // TODO: Rewrite source so that newStates are passed through here
    const unwatch = source.watch(() => {
      const nextValue = getCurrentValue(source, selector)
      if (!isEqual(currentValue, nextValue)) {
        forceUpdate()
      }
    })
    return () => { unwatch() }
  }, [currentValue, selector, source])
  return currentValue
}

export function useRelinkState<T>(source: RelinkSource<T>, selector) {
  const state = useRelinkValue(source, selector)
  return [state, source.set]
}

export function useSetRelinkState<T>(source: RelinkSource<T>) {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.set
}

export function useResetRelinkState<T>(source: RelinkSource<T>) {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.reset
}

export function useRehydrateRelinkSource<T>(source: RelinkSource<T>) {
  source[INTERNALS_SYMBOL].M$suspenseOnHydration()
  return source.hydrate
}

export { createSource, isRelinkSource } from './source'
export { waitForAll } from './wait-for'
