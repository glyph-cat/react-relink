import { IS_DEBUG_ENV } from '../constants'
import { RelinkSourceKey } from '../schema'

type SafeTypes = boolean | number | string | null | undefined | symbol

/**
 * Safely concatenates array values into strings. `Array.prototype.join` will
 * convert `null` and `undefined` into empty strings and throw an error if there
 * is a Symbol. This function aims to fix that.
 */
export function safeConcat(
  values: Array<SafeTypes>,
  separator: string
): string {
  const strStack: Array<string> = []
  for (let i = 0; i < values.length; i++) {
    strStack.push(String(values[i]))
  }
  return strStack.join(separator)
}

export function formatErrorCode(
  code: number,
  ...args: Array<SafeTypes>
): string {
  let errCode = `Relink_E${code}`
  if (args.length > 0) {
    errCode += `-${safeConcat(args, ',')}`
  }
  return errCode
}

export function TYPE_ERROR_SOURCE_KEY(typeofRawKey: string): TypeError {
  return new TypeError(
    IS_DEBUG_ENV
      ? `Expected \`key\` to be a string or number but got ${typeofRawKey}`
      : formatErrorCode(1, typeofRawKey)
  )
}

export function ERROR_CIRCULAR_DEPENDENCY(
  keyPathStack: Array<RelinkSourceKey>
): Error {
  const joinedKeyPathStack = safeConcat(keyPathStack, ' -> ')
  return new Error(
    IS_DEBUG_ENV
      ? `Circular dependencies are not allowed: ${joinedKeyPathStack}`
      : formatErrorCode(2, joinedKeyPathStack)
  )
}
