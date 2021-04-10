import { IS_DEBUG } from './constants'

export function devLog(message) {
  if (IS_DEBUG) {
    console.warn(`[Development] ${message}`)
  }
}

const onlyOnceCache = {}
export function devLogOnce(key, message) {
  if (IS_DEBUG) {
    if (!onlyOnceCache[key]) {
      onlyOnceCache[key] = true
      console.warn(`[Development] ${message}`)
    }
  }
}

export function deprecationWarn(key, message) {
  devLogOnce(key, `Deprecation warning: ${message}`)
}
