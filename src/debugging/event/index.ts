import { RelinkEvent, RelinkSource } from '../../schema'

/**
 * Creates a promise that resolves when a Relink event has been received.
 */
export function createEventPromise<S>(
  Source: RelinkSource<S>
): Promise<RelinkEvent<S>> {
  return new Promise((resolve) => {
    const unwatch = Source.watch((event) => {
      resolve(event)
      unwatch()
    })
  })
}

/**
 * Creates a promise that resolves when N Relink events have been received.
 */
export function createEventStackPromise<S>(
  Source: RelinkSource<S>,
  eventsToCollect: number
): Promise<Array<RelinkEvent<S>>> {
  return new Promise((resolve) => {
    const eventStack: Array<RelinkEvent<S>> = []
    const unwatch = Source.watch((event) => {
      eventStack.push(event)
      if (eventStack.length === eventsToCollect) {
        resolve(eventStack)
        unwatch()
      }
    })
  })
}
