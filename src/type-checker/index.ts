// Special case: We just want to check if a value is a function.
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isThenable(value: unknown): value is Promise<unknown> {
  // If `value` itself is falsy, it cannot possibly be a promise.
  if (!value) { return false }
  return isFunction(value['then'])
}
