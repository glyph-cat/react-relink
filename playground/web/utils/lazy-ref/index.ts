import {
  MutableRefObject,
  useRef as useRef_REACT,
} from 'react'

const EMPTY_OBJECT = {} as const

/**
 * A drop-in replacement for React's built-in `useRef` hook but with additional
 * flexibility to lazily declare the variable.
 * @example
 * // Before
 * const animationRef = useRef()
 * if (!animationRef.current) {
 *   animationRef.current = new Animated.Value(0)
 * }
 * // After
 * useRef(() => new Animated.Value(0))
 *
 * // You can even create a factory function outside a component
 * const createAnimatedValue = () => new Animated.Value(0)
 * // Then use it like this
 * function SomeComponent() {
 *   useRef(createAnimatedValue)
 *   // ...
 * }
 * @public
 */
export function useRef<E>(
  valueOrFactory: E | (() => E) = null
): MutableRefObject<E> {
  const mutableRefObj = useRef_REACT(EMPTY_OBJECT as unknown as E)
  if (Object.is(mutableRefObj.current, EMPTY_OBJECT)) {
    const initialValue = typeof valueOrFactory === 'function'
      ? (valueOrFactory as (() => E))()
      : valueOrFactory
    mutableRefObj.current = initialValue
  }
  return mutableRefObj
}
