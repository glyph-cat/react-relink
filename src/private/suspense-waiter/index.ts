import { CallbackWithNoParamAndReturnsVoid } from '../helper-types'

// Modified based from ovieokeh's `wrapPromise` method. Reference:
// https://github.com/ovieokeh/suspense-data-fetching/blob/master/lib/api/wrapPromise.js

export type SuspenseWaiter = CallbackWithNoParamAndReturnsVoid

/**
 * 0 = success
 * 1 = pending
 * 2 = error
 */
type SuspenseStatus = 0 | 1 | 2

export function createSuspenseWaiter(
  promise: Promise<unknown>
): SuspenseWaiter {
  let status: SuspenseStatus = 1
  let res: unknown = null
  const suspender = promise
    .then((r: unknown): void => {
      status = 0
      res = r
    })
    .catch((e): void => {
      status = 2
      res = e
    })
  return (): void => {
    switch (status) {
      case 1: throw suspender
      case 2: throw res
    }
  }
}
