import {
  MutableRefObject,
  useReducer,
  useRef,
} from 'react'
import { waitFor } from '../../api/wait-for'
import { RelinkSource } from '../../api/source'
import { RelinkEventType } from '../../schema'
import { forceUpdateReducer, useLayoutEffect } from '../custom-hooks'

// Modified based from ovieokeh's `wrapPromise` method. Reference:
// https://github.com/ovieokeh/suspense-data-fetching/blob/master/lib/api/wrapPromise.js

/**
 * @internal
 */
export type SuspenseWaiter = () => void

/**
 * 0 = success
 * 1 = pending
 * 2 = error
 * @internal
 */
type SuspenseStatus = 0 | 1 | 2

/**
 * @internal
 */
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

/**
 * @internal
 */
export function useSuspenseForDataFetching(
  source: RelinkSource<unknown>
): void {

  const waitPromise: MutableRefObject<Promise<void>> = useRef(null)
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)

  if (source.M$options.suspense) {
    // [Point A] Don't wait until component mounts, create promise for suspension
    // immediately if source is not ready.
    if (!source.M$getIsReadyStatus()) {
      waitPromise.current = (async () => {
        await waitFor(source)
        // Nullify the promise reference, otherwise it will still be there on
        // next render and result in infinite rendering.
        waitPromise.current = null
      })()
    }
    // If `promise.current` is not null, create suspense waiter out of it.
    if (waitPromise.current) {
      createSuspenseWaiter(waitPromise.current)()
    }
  }

  useLayoutEffect(() => {
    if (source.M$options.suspense) {
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
