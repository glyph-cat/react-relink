/* eslint-disable no-console */
import { IS_DEBUG_ENV } from '../constants'

type DevConsoleMethods = keyof typeof console

if (IS_DEBUG_ENV) {
  var onlyOnceCache = {
    // TODO: Make this dynamic
    log: {},
    info: {},
    warn: {},
    error: {},
  }
}

function devPrint(type: DevConsoleMethods, message: string): void {
  if (IS_DEBUG_ENV) {
    console[type](`[Development] ${message}`)
  }
}

// TODO: Export `devLog` etc to reduce declaration of 'log'

export function devPrintOnce(
  type: DevConsoleMethods,
  key: string,
  message: string
): void {
  if (IS_DEBUG_ENV) {
    if (!onlyOnceCache[type][key]) {
      onlyOnceCache[type][key] = true
      console[type](`[Development] ${message}`)
    }
  }
}

export function deprecationWarn(key: string, message: string): void {
  devPrintOnce('warn', key, `Deprecation warning: ${message}`)
}

export function devError(message: string): void {
  devPrint('error', message)
}
