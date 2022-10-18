import { MutableRefObject } from 'react'

// So that child Sources can be created in array directly, making it more
// readable while still making it possible to dispose child sources when the
// test has completed.

export function attachRef<V>(ref: MutableRefObject<V>, value: V): V {
  ref.current = value
  return value
}
