import { MutableRefObject } from 'react'
import { RelinkSourceKey } from '../../abstractions'
import { RELINK_CONFIG } from '../../api/config'
import { IS_DEV_ENV, IS_INTERNAL_DEBUG_ENV } from '../../constants'

// NOTE: The code in this file should not be included in minified builds because
// the code is conditionally with `IS_INTERNAL_DEBUG_ENV`. A check was made on 5 Oct 2021
// and so far the code has been bundled with the intended bahaviour.

/**
 * @internal
 */
export function performanceNow(): number {
  // NOTE: For stability purposes we do a check on `typeof window` instead of
  // using the `IS_CLIENT_ENV` constant because we have no control over which
  // builds are used and what environment they are run in.
  if (typeof window !== 'undefined') {
    return window.performance.now()
  } else {
    return Date.now()
  }
}

// NOTE:
// * If reducers are 'slow', a warning will be shown by the end of execution
// * If reducers have not completed after 'a long time', we consider them as
// 'not responding' and show a warning right away. The 'slow' warning will still
// appear if they are resolved eventually.
// * Only warnings are shown, if we throw error or cancel the execution and move
// to the next reducer, it might only result in a corrupted state and create
// more problems.

/**
 * @internal
 */
export const PERFORMANCE_SLOW_THRESHOLD_MS = 500

/**
 * @internal
 */
export const PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS = 10000

/**
 * @internal
 */
type MarkReducerEndPayload = [
  isSlow: boolean,
  isNotResponding: boolean,
]

/**
 * @internal
 */
interface ReducerPerformanceMeasurer {
  isAsync: MutableRefObject<boolean>
  stop(): MarkReducerEndPayload
}

/**
 * Marks the start of a reducer's execution.
 * @internal
 */
export function startMeasuringReducerPerformance(
  sourceKey: RelinkSourceKey
): ReducerPerformanceMeasurer {

  let timeStart: number
  let timeoutRef: ReturnType<typeof setTimeout>
  let isNotResponding = false
  const isAsync: MutableRefObject<boolean> = { current: false }

  // Only perform check in developer environment AND when config is set to
  // request for it to happen.
  const shouldRunPerformanceCheck = IS_DEV_ENV && !RELINK_CONFIG.hidePerformanceWarnings

  if (shouldRunPerformanceCheck) {
    timeStart = performanceNow()
    timeoutRef = setTimeout((): void => {
      isNotResponding = true
      // eslint-disable-next-line no-console
      console.warn(formatReducerNotRespondingWarning(sourceKey, isAsync.current))
    }, PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS)
  }

  /**
   * Shows a warning if elapsed time exceeds the executed threshold.
   * @returns True if exceeded the threshold, otherwise false, but only in
   * internal testing environment, not the bundled ones.
   */
  const stop = (): MarkReducerEndPayload => {
    if (shouldRunPerformanceCheck) {
      clearTimeout(timeoutRef)
      const timeEnd = performanceNow()
      const timeDiff = Math.round(timeEnd - timeStart)
      const isSlow = timeDiff >= PERFORMANCE_SLOW_THRESHOLD_MS
      // console.log({ timeDiff, isAsync: isAsync.current, slowThreshold, isSlow })
      if (isSlow) {
        // eslint-disable-next-line no-console
        console.warn(formatReducerSlowWarning(sourceKey, timeDiff, isAsync.current))
      }
      if (IS_INTERNAL_DEBUG_ENV) {
        return [isSlow, isNotResponding]
      }
    }
  }

  return {
    isAsync,
    stop,
  }

}

/**
 * Formats the warning message for when reducers are slow.
 * @internal
 */
export function formatReducerSlowWarning(
  sourceKey: RelinkSourceKey,
  timeDiff: number,
  isAsync: boolean
): string {
  // NOTE: Wording inconsistency 'a synchronous' and 'an async' is intended to
  // make it easier to differentiate between warnings for synchronous and
  // asynchronous reducers.
  if (isAsync) {
    return `Spent ${timeDiff}ms to execute an async reducer in '${String(sourceKey)}'`
  } else {
    return `Spent ${timeDiff}ms to execute a synchronous reducer in '${String(sourceKey)}'`
  }
}

/**
 * Formats the warning message for when reducers are considered not responding.
 * @internal
 */
export function formatReducerNotRespondingWarning(
  sourceKey: RelinkSourceKey,
  isAsync: boolean
): string {
  if (isAsync) {
    return `${PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS}ms and counting: An async reducer has not yet been resolved for '${String(sourceKey)}'.`
  } else {
    return `${PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS}ms and counting: A synchronous reducer is still running for '${String(sourceKey)}'.`
  }
}
