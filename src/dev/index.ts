/* eslint-disable no-console */
import { IS_DEBUG_ENV } from '../constants'

function devPrint(
  type: keyof typeof console,
  ...args: unknown[]
): void {
  if (IS_DEBUG_ENV) {
    // @ts-ignore
    console[type]('[Development]', ...args)
  }
}

export function devError(...args: unknown[]): void {
  devPrint('error', ...args)
}

export function devWarn(...args: unknown[]): void {
  devPrint('warn', ...args)
}
