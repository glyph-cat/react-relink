import chalk from 'chalk'
import { IS_INTERNAL_DEBUG_ENV } from '../../constants'
import { RelinkSourceKey } from '../../schema'
import { getHexFromString } from './get-hex-from-string'

// KIV: Seems like code in this file will be included in the bundle, going to
// stop using this temporarily.

let logStore: Array<string> = []

export function dumpDebuglogs(): void {
  if (logStore.length > 0) {
    // eslint-disable-next-line no-console
    console.log(logStore.join('\n'))
    logStore = []
  }
}

const GENERIC_SYMBOL = Symbol('Generic')
/**
 * Specify source keys here to focus only on them. Logs that belong to other
 * sources will not be logged.
 */
const DEBUG_LOG_FILTER: Array<RelinkSourceKey> = [

  // === Defaults ===
  GENERIC_SYMBOL,
  'debug-logger-test',

  // === `waitForAll` ===
  // // 'test/waitForAll/some-with-deps/a',
  // 'test/waitForAll/some-with-deps/b',
  // 'test/waitForAll/some-with-deps/b/sub-1',
  // // 'test/waitForAll/some-with-deps/c',

  // === 01-lifecycle.init ===
  'test/Source/lifecycle.init/async',

]

export interface DebugLogger {
  /**
   * @returns Status on whether log was made.
   */
  echo(message: string): true | void
}

function getTimestamp(): string {
  const now = new Date()
  const hh = `${now.getHours()}`.padStart(2, '0')
  const mm = `${now.getMinutes()}`.padStart(2, '0')
  const ss = `${now.getSeconds()}`.padStart(2, '0')
  const ms = `${now.getMilliseconds()}`.padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

/**
 * Instantiate a logger that only runs in the internal debugging environment.
 * Will be omitted in bundled versions of the code bundle.
 */
export function createDebugLogger(sourceKey: RelinkSourceKey): DebugLogger {

  const echo = (message: string): true | void => {
    if (IS_INTERNAL_DEBUG_ENV) {
      if (DEBUG_LOG_FILTER.includes(sourceKey)) {
        const timestamp = chalk.grey(getTimestamp())
        if (Object.is(sourceKey, GENERIC_SYMBOL)) {
          logStore.push(`${timestamp} ${message}`)
        } else {
          const colorizedSourceKey = chalk.hex(
            getHexFromString(String(sourceKey))
          )(String(sourceKey))
          logStore.push(`${timestamp} ${colorizedSourceKey} ${message}`)
        }
        return true
      }
    }
  }

  return {
    echo,
  }

}

export const genericDebugLogger = createDebugLogger(GENERIC_SYMBOL)
