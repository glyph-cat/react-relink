import { useDebugValue, useReducer } from 'react'
import isEqual from 'react-fast-compare'
import { IS_DEBUG } from './constants'
import deepCopy from './deep-copy'
import { deprecationWarn, devPrintOnce } from './dev-log'

// So that eslint sees it as the original useEffect
import useEffect from './use-isomorphic-layout-effect'

devPrintOnce(
  'info',
  'selector',
  'State values passed into selectors will be directly referenced from Relink\'s internal state in the next major version. See: https://github.com/chin98edwin/react-relink#immutability'
)

function updateReducer(selector, source) {
  // Returns a factory
  return () => (selector ? selector(source.M$getDirectState()) : source.M$getDirectState())
}
  
// NOTE: For experimental version of `useRelinkValue`
// Because React uses Object.is comparison, it will be exhausive to compare
// deep copies of the states, hence direct references are used for selectors
// when the selected value is finally going to be returned, it is only deep
// copied as a safeguard...
// `deepCopy` is still called on every render, by deep-copying the selected
// values, we can gain some performance boost

export function useRelinkValue_EXPERIMENTAL(source, selector) {
  source.M$suspenseOnHydration()
  const [value, update] = useReducer(
    updateReducer(selector, source),
    null,
    updateReducer(selector, source)
  )
  useDebugValue(undefined, () =>
    IS_DEBUG
      ? {
          key: source.M$key || '(Unnamed)',
          selector,
          value,
        }
      : undefined
  )
  useEffect(() => {
    const listenerId = source.M$listener.M$add(update)
    return () => {
      source.M$listener.M$remove(listenerId)
    }
  }, [source])
  return deepCopy(value)
}

const forceUpdateReducer = (c) => c + 1

export function useRelinkValue(source, selector) {
  source.M$suspenseOnHydration()
  const currentValue =
    typeof selector === 'function' ? selector(source.get()) : source.get()

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
    const listenerId = source.M$listener.M$add(() => {
      const nextValue =
        typeof selector === 'function' ? selector(source.get()) : source.get()
      if (!isEqual(currentValue, nextValue)) {
        forceUpdate()
      }
    })
    return () => {
      source.M$listener.M$remove(listenerId)
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

export { createSource } from './source'
