import { MutableRefObject, useReducer, useRef } from 'react'
import { waitFor } from '../../api/wait-for'
import { INTERNALS_SYMBOL } from '../../constants'
import { RelinkSource, RelinkEventType } from '../../schema'
import { forceUpdateReducer, useLayoutEffect } from '../custom-hooks'
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
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
  if (source[INTERNALS_SYMBOL].M$isSuspenseEnabled) {
    // [Point A] Don't wait until component mounts, create promise for suspension
    // immediately if source is not ready.
    if (!source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
      waitPromise.current = waitFor(source)
    }
    // If `promise.current` is not null, create suspense waiter out of it.
    if (waitPromise.current) {
      createSuspenseWaiter(waitPromise.current)()
    }
  }
  useLayoutEffect((): CallbackWithNoParamAndReturnsVoid => {
    if (source[INTERNALS_SYMBOL].M$isSuspenseEnabled) {
      const unwatch = source.watch((event): void => {
        // Ignore if event is not caused by hydration
        if (event.type !== RelinkEventType.hydrate) { return }
        if (event.isHydrating) {
          // If hydration starts, trigger an update so that we can go to [Point A]
          forceUpdate()
        }
      })
      return (): void => {
        unwatch()
      }
    }
  }, [source])
}
