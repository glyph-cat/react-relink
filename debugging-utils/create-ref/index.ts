import { MutableRefObject } from 'react'

export function createRef<V>(value: V = null): MutableRefObject<V> {
  return { current: value }
}
