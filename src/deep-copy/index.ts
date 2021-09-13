import fastCopy from 'fast-copy'

/**
 * Wrapper around 'fast-copy'.
 */
function deepCopy<V>(value: V): V {
  if (typeof value !== 'object' || value === null) {
    return value
  } else {
    return fastCopy(value)
  }
}

export default deepCopy
