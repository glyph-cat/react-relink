/* eslint-disable no-console */
import { IS_DEV_ENV, REPORT_ISSUE_URL } from '../../constants'
import { RelinkSourceKey } from '../../schema'
import type { HydrationConcludeType } from '../no-useless-hydration-warner'
import { formatFunctionNotationArray, safeStringJoin, SafeStringJoinTypes } from '../string-formatting'

// #region Utils

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
export function showInternalErrorNextSteps(bugReportTitle: string): void {
  if (IS_DEV_ENV) {
    bugReportTitle = bugReportTitle.replace(/\s/g, '+') // Make URL-friendly
    const urlToSearchBug = `${REPORT_ISSUE_URL}?q=${bugReportTitle}`
    const urlToReportBug = `${REPORT_ISSUE_URL}/new?labels=bug&template=bug-report.md&title=${bugReportTitle}`
    console.error([
      'Next steps:',
      `1. You can check if similar reports have been made at ${urlToSearchBug}`,
      `2. If no such reports have been made, you can file an issue at ${urlToReportBug}`,
    ].join('\n'))
  }
}

// #endregion

// NOTES:
// - `HANDLE_WARNING_...` only show warning message with `console.warn`.
// - `HANDLE_ERROR_...` only show error message with `console.error`.
// - `THROW_ERROR_...` an error will be thrown, additional error messages may be
//    shown via `console.error` before the error is thrown.

// #region Warnings

/**
 * @internal
 */
export function HANDLE_WARNING_NO_EMPTY_KEYS_ALLOWED(): void {
  if (IS_DEV_ENV) {
    console.warn('Did you just pass an empty string as a source key? Be careful, it can lead to problems that are hard to diagnose and debug later on.')
  }
}

/**
 * @internal
 */
export function HANDLE_WARNING_NO_FORWARDED_HYDRATION_CALLBACK_VALUE_ALLOWED(
  typeofPayload: string
): void {
  if (IS_DEV_ENV) {
    console.warn(`Expected the callback passed to \`Source.hydrate()\` or declared for \`lifecycle.init\` to return undefined but got ${typeofPayload}. You should not rely on hydration callbacks to return any value as this just happens to be an unintended feature. This behaviour might change as Relink's internal implementation changes in the future.`)
  }
}

/**
 * @internal
 */
export function HANDLE_WARNING_SOURCE_DISPOSAL_WITH_ACTIVE_DEPS(
  key: RelinkSourceKey,
  childDepStack: Array<RelinkSourceKey>
): void {
  if (IS_DEV_ENV) {
    console.warn(`Disposing/Cleaning up '${String(key)}' while there are still other sources that depend on it: '${safeStringJoin(childDepStack, '\', \'')}'. The source will stop emitting events upon state change, but this means components that rely on the children of this source might have unintended behaviours.`)
  }
}

// #endregion

// #region Errors

/**
 * @internal
 */
export function THROW_TYPE_ERROR_SOURCE_KEY(typeofRawKey: string): void {
  throw new TypeError(IS_DEV_ENV
    ? `Expected \`key\` to be a string, number, or symbol but got ${typeofRawKey}`
    : formatErrorCode(1, typeofRawKey)
  )
}

/**
 * @internal
 */
export function THROW_ERROR_CIRCULAR_DEPENDENCY(
  keyPathStack: Array<RelinkSourceKey>
): void {
  const joinedKeyPathStack = safeStringJoin(keyPathStack, ' -> ')
  throw new Error(IS_DEV_ENV
    ? `Circular dependencies are not allowed: ${joinedKeyPathStack}`
    : formatErrorCode(2, joinedKeyPathStack)
  )
}

/**
 * @internal
 */
export function THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER(
  marker: unknown
): void {
  showInternalErrorNextSteps('Malformed hydration marker')
  throw new Error(IS_DEV_ENV
    ? `Internal error: malformed hydration marker '${String(marker)}'`
    : formatErrorCode(3, String(marker))
  )
}

/**
 * @internal
 */
export function HANDLE_INTERNAL_ERROR_FAIL_TO_REMOVE_SELF_KEY_FROM_PARENT(
  currentKey: RelinkSourceKey,
  parentKey: RelinkSourceKey
): void {
  if (IS_DEV_ENV) {
    // NOTE: It could also mean that two or more sources have circular dependency.
    // But an error would have been thrown at the time of source creation, the
    // only exception is when sources are created/disposed during setup/teardown
    // in tests.
    console.error(`Internal error: Failed to unregister source key '${String(currentKey)}' from parent source '${String(parentKey)}'. While this is not immediately fatal, it could indicate a memory leak.`)
    showInternalErrorNextSteps('Failed to unregister source key from parent source')
  }
}

/**
 * @internal
 */
export function HANDLE_ERROR_NO_USELESS_HYDRATION(
  sourceKey: RelinkSourceKey,
  currentConcludeType: HydrationConcludeType,
  concludeTypeHistoryStack: Array<HydrationConcludeType>
): void {
  if (IS_DEV_ENV) {
    console.error(`Attempted to ${currentConcludeType} a hydration in '${String(sourceKey)}' even though it has previously been concluded with: ${formatFunctionNotationArray(concludeTypeHistoryStack)}. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to \`Source.hydrate()\` instead, otherwise it might indicate a memory leak in your application.`)
  }
}

// #endregion
