import { IS_CLIENT_ENV, IS_DEBUG_ENV, IS_DIST_ENV } from '../../constants'
import { devWarn } from '../dev'

export function performanceNow(): number {
  // Since we are more interested in measuring perfofmance in the client
  // We don't need to conditionally import 'perf_hooks'.
  if (IS_CLIENT_ENV) {
    return window.performance.now()
  } else {
    return 0
  }
}

export function formatPerformanceThresholdWarning(
  timeDiff: number,
  isAsync: boolean
): string {
  // NOTE: Wording inconsistency 'a synchronous' and 'an async' is intended to
  // make it easier to differentiate between warnings for synchronous and
  // asynchronous reducers.
  if (isAsync) {
    return `Spent ${timeDiff}ms to execute an async reducer`
  } else {
    return `Spent ${timeDiff}ms to execute a synchronous reducer`
  }
}

const PERFORMANCE_SYNC_THRESHOLD_MS = 15
const PERFORMANCE_ASYNC_THRESHOLD_MS = 300

/**
 * Shows a warning if elapsed time exceeds the executed threshold.
 * @returns True if exceeded the threshold, otherwise false, but only in
 * internal testing environment, not the distributed ones.
 */
export function warnIfExceedPerformanceThreshold(
  timeStart: number,
  timeEnd: number,
  isAsync: boolean
): boolean | void {
  if (IS_DEBUG_ENV) {
    const timeDiff = timeEnd - timeStart
    const hasExceededLimit = isAsync
      ? timeDiff > PERFORMANCE_ASYNC_THRESHOLD_MS
      : timeDiff > PERFORMANCE_SYNC_THRESHOLD_MS
    if (hasExceededLimit) {
      devWarn(formatPerformanceThresholdWarning(timeDiff, isAsync))
    }
    if (!IS_DIST_ENV) {
      return hasExceededLimit
    }
  }
}
