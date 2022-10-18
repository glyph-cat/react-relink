import { MutableRefObject, useRef as useRef_REACT } from 'react'

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
  const isInitialized = useRef_REACT(false)
  const mutableRefObj = useRef_REACT<E>()
  if (!isInitialized.current) {
    const initialValue = typeof valueOrFactory === 'function'
      ? (valueOrFactory as (() => E))()
      : valueOrFactory
    mutableRefObj.current = initialValue
    isInitialized.current = true
  }
  return mutableRefObj
}
