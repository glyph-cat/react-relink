import { useDebugValue, useReducer } from 'react'
import reactFastCompare from 'react-fast-compare'
import { IS_DEBUG } from './constants'
import { deprecationWarn, devPrintOnce } from './dev-log'

// So that eslint sees it as the original useEffect
import useEffect from './use-isomorphic-layout-effect'

devPrintOnce(
  'info',
  'selector',
  'State values passed into selectors will be directly referenced from Relink\'s internal state in the next major version. See: https://github.com/chin98edwin/react-relink#immutability'
)

function isEqual(mutable, a, b) {
  return mutable ? Object.is(a, b) : reactFastCompare(a, b)
}

// NOTE: For selector behavior >= 1.X.X
// Since React uses Object.is comparison, it will be exhausive to compare deep copies
// of the states, hence direct references are used for selectors.
// When the selected value is finally going to be returned from the hook, only then
// it is deep copied. Although this means deep copy still takes place on every render,
// but by deep-copying only the selected values, we can gain some performance boost

const forceUpdateReducer = (c) => c + 1

function getCurrentValue(source, selector) {
  const currentValue =
    typeof selector === 'function' ? selector(source.get()) : source.get()
  return currentValue
}

export function useRelinkValue(source, selector) {
  source.M$suspenseOnHydration()
  const currentValue = getCurrentValue(source, selector)

  useDebugValue(undefined, () =>
    IS_DEBUG
      ? {
        key: source.M$key || '(Unnamed)',
        selector,
        value: currentValue,
      }
      : undefined
  )

  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
  useEffect(() => {
    const unwatch = source.watch(() => {
      const nextValue = getCurrentValue(source, selector)
      if (!isEqual(source.M$isMutable, currentValue, nextValue)) {
        forceUpdate()
      }
    })
    return () => {
      unwatch()
    }
  }, [currentValue, selector, source])
  return currentValue
}

export function useRelinkState(source, selector) {
  const state = useRelinkValue(source, selector)
  return [state, source.set]
}

export function useSetRelinkState(source) {
  source.M$suspenseOnHydration()
  return source.set
}

export function useResetRelinkState(source) {
  source.M$suspenseOnHydration()
  return source.reset
}

export function useRehydrateRelinkSource(source) {
  source.M$suspenseOnHydration()
  return source.hydrate
}

export function dangerouslyGetRelinkValue(source) {
  deprecationWarn(
    'dGet',
    'Prefer `YourSource.get()` over `dangerouslyGetRelinkValue(YourSource)`'
  )
  return source.get()
}

export function dangerouslySetRelinkState(source, partialState) {
  deprecationWarn(
    'dSet',
    'Prefer `YourSource.set(...)` over `dangerouslySetRelinkValue(YourSource, ...)`'
  )
  source.set(partialState)
}

export function dangerouslyResetRelinkState(source) {
  deprecationWarn(
    'dReset',
    'Prefer `YourSource.reset()` over `dangerouslyResetRelinkValue(YourSource)`'
  )
  source.reset()
}

export function dangerouslyRehydrateRelinkSource(source, callback) {
  deprecationWarn(
    'dHyd',
    'Prefer `YourSource.hydrate(...)` over `dangerouslyHydrateRelinkValue(YourSource, ...)`'
  )
  source.hydrate(callback)
}

export { createSource, isRelinkSource } from './source'
export { waitForAll } from './wait-for'
