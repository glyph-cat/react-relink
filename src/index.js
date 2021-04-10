import { useDebugValue, useReducer } from 'react'
import isEqual from 'react-fast-compare'
import { IS_DEBUG } from './constants'

// So that eslint sees it as the original useEffect
import useEffect from './use-isomorphic-layout-effect'

const forceUpdateReducer = (c) => c + 1

export function useRelinkValue(source, selector) {
  source.M$suspenseOnHydration()
  const currentValue =
    typeof selector === 'function' ? selector(source.M$get()) : source.M$get()

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
        typeof selector === 'function'
          ? selector(source.M$get())
          : source.M$get()
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
  return [state, source.M$set]
}

export function useSetRelinkState(source) {
  source.M$suspenseOnHydration()
  return source.M$set
}

export function useResetRelinkState(source) {
  source.M$suspenseOnHydration()
  return source.M$reset
}

export function useRehydrateRelinkSource(source) {
  source.M$suspenseOnHydration()
  return source.M$hydrate
}

export function dangerouslyGetRelinkValue(source) {
  return source.M$get()
}

export function dangerouslySetRelinkState(source, partialState) {
  source.M$set(partialState)
}

export function dangerouslyResetRelinkState(source) {
  source.M$reset()
}

export function dangerouslyRehydrateRelinkSource(source, callback) {
  source.M$hydrate(callback)
}

export { createSource, UNSTABLE_createSource } from './source'
