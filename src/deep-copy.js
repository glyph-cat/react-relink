import fastCopy from 'fast-copy'

/**
 * @description Wrapper around 'fast-copy'
 * @param {any} value
 * @returns {any}
 */
function deepCopy(value) {
  if (typeof value !== 'object' || value === null) {
    return value
  } else {
    return fastCopy(value)
  }
}

export default deepCopy
