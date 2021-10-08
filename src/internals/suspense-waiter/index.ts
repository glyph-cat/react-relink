import { MutableRefObject, useRef } from 'react'
import { waitFor } from '../../api/wait-for'
import { RelinkSource, RelinkEventType } from '../../schema'
import { useLayoutEffect } from '../custom-hooks'
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

// KIV: Not sure why `performSuspension` doesn't work

// export function performSuspension(
//   promise: Promise<unknown>
// ): void {
//   createSuspenseWaiter(promise)()
// }

// export function performSuspension(
//   promise: Promise<unknown>
// ): void {
//   let status: SuspenseStatus = 1
//   let res: unknown = null
//   const suspensePromise = promise.then((r: unknown): void => {
//     status = 0
//     res = r
//   }).catch((e): void => {
//     status = 2
//     res = e
//   })
//   // 'Seems like a bug in the inference engine'
//   // Ref: https://stackoverflow.com/a/48919497/5810737
//   switch (status as SuspenseStatus) {
//     case 1: throw suspensePromise
//     case 2: throw res
//   }
// }

export function useSuspenseForDataFetching(
  source: RelinkSource<unknown>
): void {
  const waitPromise: MutableRefObject<Promise<void>> = useRef(null)
  if (waitPromise.current) {
    createSuspenseWaiter(waitPromise.current)()
  }
  useLayoutEffect((): CallbackWithNoParamAndReturnsVoid => {
    const unwatch = source.watch((event): void => {
      // Ignore if event is not caused by hydration
      if (event.type !== RelinkEventType.hydrate) { return }
      if (event.isHydrating) {
        waitPromise.current = waitFor(source)
      }
    })
    return (): void => {
      unwatch()
    }
  }, [source])
}
