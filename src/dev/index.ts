import { IS_DEBUG_ENV } from '../constants'

function devPrint(
  type: 'log' | 'info' | 'warn' | 'error',
  ...args: unknown[]
): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console[type]('[Development]', ...args)
  }
}

export function devError(...args: unknown[]): void {
  devPrint('error', ...args)
}

export function devWarn(...args: unknown[]): void {
  devPrint('warn', ...args)
}
