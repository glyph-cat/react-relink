// Special case: We just want to check if a value is a function.
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object'
}

/**
 * Helps prevent using await on normal functions. Although there's normally no
 * harm to use await on normal functions, it creates a slight delay that is not
 * tolerable for our use case here.
 */
export function isThenable(value: unknown): value is Promise<unknown> {
  // If `value` itself is falsy, it cannot possibly be a promise.
  if (!value) { return false }
  // @ts-expect-error It is not known if `.then` is defined, but to be able to
  // reach this line, `value` must somehow be defined.
  return isFunction(value.then)
}
