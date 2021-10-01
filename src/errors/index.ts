import { IS_DEBUG_ENV } from '../constants'
import { RelinkSourceKey } from '../schema'

export function formatErrorCode(
  code: number,
  ...args: Array<unknown>
): string {
  let errCode = `Relink_E${code}`
  if (args.length > 0) {
    errCode += `-${args.join(',')}`
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
  return new Error(
    IS_DEBUG_ENV
      ? `Circular dependencies are not allowed: ${keyPathStack.join(' -> ')}`
      : formatErrorCode(2, keyPathStack)
  )
}
