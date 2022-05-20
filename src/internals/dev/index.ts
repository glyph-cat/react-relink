import { IS_DEV_ENV } from '../../constants'

/**
 * @internal
 */
export function devError(message: string): void {
  if (IS_DEV_ENV) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
}

/**
 * @internal
 */
export function devWarn(message: string): void {
  if (IS_DEV_ENV) {
    // eslint-disable-next-line no-console
    console.warn(message)
  }
}
