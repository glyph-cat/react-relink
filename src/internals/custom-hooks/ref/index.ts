import {
  MutableRefObject,
  useEffect,
  useRef as useRef_React, // eslint-disable-line no-restricted-imports
} from 'react'
import { isFunction } from '../../type-checker'

/**
 * @private
 */
let idCounter = 0

/**
 * @private
 */
const store: Record<number, MutableRefObject<unknown>> = {}

export function useRef<T>(
  initialValue: T | (() => T) = null
): MutableRefObject<T> {
  const isFirstRender = useRef_React(true)
  const id = useRef_React<number>()
  if (isFirstRender.current) {
    isFirstRender.current = false
    id.current = ++idCounter
  }
  if (!store[id.current]) {
    store[id.current] = {
      current: isFunction(initialValue)
        ? initialValue()
        : initialValue,
    }
  }
  useEffect(() => {
    return () => {
      delete store[id.current]
    }
  }, [id])
  return store[id.current] as MutableRefObject<T>
}
