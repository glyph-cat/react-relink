import { IS_DEV_ENV, REPORT_ISSUE_URL } from '../../constants'
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

/**
 * @internal
 */
export function getWarningForSourceDisposalWithActiveDeps(
  key: RelinkSourceKey,
  childDepStack: Array<RelinkSourceKey>
): string {
  return `Disposing/Cleaning up '${String(key)}' while there are still other sources that depend on it: '${safeStringJoin(childDepStack, '\', \'')}'. The source will stop emitting events upon state change, but this means components that rely on the children of this source might have unintended behaviours.`
}

/**
 * @internal
 */
export function getErrorMessageOnFailToRemoveSelfKeyFromParentDep(
  currentKey: RelinkSourceKey,
  parentKey: RelinkSourceKey
): string {
  const bugReportTitle = 'Failed to unregister source key from parent source'.replace(/\s/g, '+')
  const urlToSearchBug = `${REPORT_ISSUE_URL}?q=${bugReportTitle}`
  const linkToReportBug = `${REPORT_ISSUE_URL}/new?labels=bug&template=bug-report.md&title=${bugReportTitle}`
  return [
    `Internal error: Failed to unregister source key '${String(currentKey)}' from parent source '${String(parentKey)}'. While this is not immediately fatal, it could indicate a memory leak.`,
    '', // empty line
    'Next steps:',
    `1. You can check if similar reports have been made at ${urlToSearchBug}`,
    `2. If no such reports have been made, you can file an issue at ${linkToReportBug}`,
  ].join('\n')
}
