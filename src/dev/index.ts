import { IS_DEBUG_ENV } from '../constants'

function devPrint(
  type: 'log' | 'info' | 'warn' | 'error',
  message: string
): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console[type](`[Development] ${message}`)
  }
}

export function devError(message: string): void {
  devPrint('error', message)
}

export function devWarn(message: string): void {
  devPrint('warn', message)
}
