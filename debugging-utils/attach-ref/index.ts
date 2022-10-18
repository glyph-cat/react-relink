import { MutableRefObject } from 'react'

// So that child Sources can be created in array directly, making it more
// readable while still making it possible to dispose child sources when the
// test has completed.

/**
 * Assigns the value to a ref and returns the value as-is.
 * @example
 * const someRef = { current: null }
 * const someValue = attachRef(someRef, 'foobar')
 * console.log(someRef.current) // 'foobar'
 * console.log(someValue) // 'foobar'
 */
export function attachRef<V>(ref: MutableRefObject<V>, value: V): V {
  ref.current = value
  return value
}
