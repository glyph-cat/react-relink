import { IS_DEV_ENV } from '../../constants'
import { RelinkSourceKey } from '../../schema'
import { safeStringJoin, SafeStringJoinTypes } from '../string-formatting'

/**
 * @param code - The error code in number.
 * @param args - Arguments to pass along.
 * @returns The concatenated error code
 * @internal
 */
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

/**
 * @internal
 */
export function TYPE_ERROR_SOURCE_KEY(typeofRawKey: string): TypeError {
  return new TypeError(
    IS_DEV_ENV
      ? `Expected \`key\` to be a string, number, or symbol but got ${typeofRawKey}`
      : formatErrorCode(1, typeofRawKey)
  )
}

/**
 * @internal
 */
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

/**
 * @internal
 */
export function getWarningForForwardedHydrationCallbackValue(
  typeofPayload: string
): string {
  return `Expected the callback passed to \`Source.hydrate()\` or declared for \`lifecycle.init\` to return undefined but got ${typeofPayload}. You should not rely on hydration callbacks to return any value as this just happens to be an unintended feature. This behaviour might change as Relink's internal implementation changes in the future.`
}
