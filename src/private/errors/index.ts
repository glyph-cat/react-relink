import { IS_DEV_ENV } from '../../constants'
import { RelinkSourceKey } from '../../schema'
import { safeStringJoin, SafeStringJoinTypes } from '../string-formatting'

export function formatErrorCode(
  code: number,
  ...args: Array<SafeStringJoinTypes>
): string {
  let errCode = `Relink_E${code}`
  if (args.length > 0) {
    errCode += `-${safeStringJoin(args, ',')}`
  }
  return errCode
}

export function TYPE_ERROR_SOURCE_KEY(typeofRawKey: string): TypeError {
  return new TypeError(
    IS_DEV_ENV
      ? `Expected \`key\` to be a string or number but got ${typeofRawKey}`
      : formatErrorCode(1, typeofRawKey)
  )
}

export function ERROR_CIRCULAR_DEPENDENCY(
  keyPathStack: Array<RelinkSourceKey>
): Error {
  const joinedKeyPathStack = safeStringJoin(keyPathStack, ' -> ')
  return new Error(
    IS_DEV_ENV
      ? `Circular dependencies are not allowed: ${joinedKeyPathStack}`
      : formatErrorCode(2, joinedKeyPathStack)
  )
}
