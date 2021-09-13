import { CallbackWithNoParamAndReturnsVoid } from '../helper-types'

// Modified based from ovieokeh's `wrapPromise` method. Reference:
// https://github.com/ovieokeh/suspense-data-fetching/blob/master/lib/api/wrapPromise.js

export type SuspenseWaiter = CallbackWithNoParamAndReturnsVoid

export function createSuspenseWaiter(
  promise: Promise<void>
): SuspenseWaiter {
  let status = 1 // 0 = success; 1 = pending; 2 = error
  let res = null
  const suspender = promise
    .then((r): void => {
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
