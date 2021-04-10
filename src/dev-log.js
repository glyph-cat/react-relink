import { IS_DEBUG } from './constants'

if (IS_DEBUG) {
  var onlyOnceCache = {
    log: {},
    info: {},
    warn: {},
    error: {},
  }
}

/**
 * @param {'log'|'info'|'warn'|'error'} type
 * @param {string} message
 */
export function devPrint(type, message) {
  if (IS_DEBUG) {
    console[type](`[Development] ${message}`)
  }
}

/**
 * @param {'log'|'info'|'warn'|'error'} type
 * @param {string} key
 * @param {string} message
 */
export function devPrintOnce(type, key, message) {
  if (IS_DEBUG) {
    if (!onlyOnceCache[type][key]) {
      onlyOnceCache[type][key] = true
      console[type](`[Development] ${message}`)
    }
  }
}

export function deprecationWarn(key, message) {
  devPrintOnce('warn', key, `Deprecation warning: ${message}`)
}
