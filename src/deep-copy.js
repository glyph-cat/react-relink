import cloneDeep from 'lodash.clonedeep';

/**
 * @description Wrapper around Lodash's `cloneDeep` method.
 * @param {any} value
 * @returns {any}
 */
function deepCopy(value) {
  if (typeof value !== 'object' || value === null) {
    return value;
  } else {
    return cloneDeep(value);
  }
}

export default deepCopy;
