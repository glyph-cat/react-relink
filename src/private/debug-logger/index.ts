import { IS_DEBUG_ENV } from '../../constants'
import { RelinkSourceKey } from '../../schema'

let logStore: Array<string> = []

export function dumpDebuglogs(): void {
  if (logStore.length > 0) {
    // eslint-disable-next-line no-console
    console.log([
      '=== Debug Logs dump start ===',
      ...logStore,
      '=== Debug Logs dump end ===',
    ].join('\n'))
    logStore = []
  }
}

/**
 * Specify source keys here to focus only on them. Logs that belong to other
 * sources will not be logged.
 */
const DEBUG_LOG_FILTER: Array<RelinkSourceKey> = [
  'debug-logger-test',
  // 'test/waitForAll/some-with-deps/a',
  'test/waitForAll/some-with-deps/b',
  'test/waitForAll/some-with-deps/b/sub-1',
  // 'test/waitForAll/some-with-deps/c',
]

export interface DebugLogger {
  /**
   * @returns Status on whether log was made.
   */
  echo(message: string): true | void
}

function getTimestamp(): string {
  const now = new Date()
  const DD = `${now.getDate()}`.padStart(2, '0')
  const MM = `${now.getMonth() + 1}`.padStart(2, '0')
  const YYYY = now.getFullYear()
  const hh = `${now.getHours()}`.padStart(2, '0')
  const mm = `${now.getMinutes()}`.padStart(2, '0')
  const ss = `${now.getSeconds()}`.padStart(2, '0')
  const ms = `${now.getMilliseconds()}`.padStart(3, '0')
  return `${DD}/${MM}/${YYYY} ${hh}:${mm}:${ss}.${ms}`
}

/**
 * Instantiate a logger that only runs in the internal debugging environment.
 * Will be omitted in distributable versions of the code bundle.
 */
export function createDebugLogger(sourceKey: RelinkSourceKey): DebugLogger {

  const echo = (message: string): true | void => {
    if (IS_DEBUG_ENV) {
      if (DEBUG_LOG_FILTER.includes(sourceKey)) {
        logStore.push(`${getTimestamp()} ${String(sourceKey)}: ${message}`)
        return true
      }
    }
  }

  return {
    echo,
  }

}
