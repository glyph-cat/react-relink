import { IS_DEBUG_ENV } from '../../constants'

export function devError(message: string): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
}

export function devWarn(message: string): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console.warn(message)
  }
}
