import type { RelinkEvent, RelinkSource } from '../../src/bundle'

/**
 * Creates a promise that resolves when a Relink event has been received.
 * @internal
 */
export function createEventLogPromise<State>(
  Source: RelinkSource<State>
): Promise<RelinkEvent<State>> {
  return new Promise((resolve) => {
    const unwatch = Source.watch((event) => {
      unwatch()
      resolve(event)
    })
  })
}

/**
 * Creates a promise that resolves when N Relink events have been received.
 * @internal
 */
export function createEventLogStackPromise<State>(
  Source: RelinkSource<State>,
  eventsToCollect: number
): Promise<Array<RelinkEvent<State>>> {
  return new Promise((resolve) => {
    const eventStack: Array<RelinkEvent<State>> = []
    const unwatch = Source.watch((event) => {
      eventStack.push(event)
      if (eventStack.length === eventsToCollect) {
        unwatch()
        resolve(eventStack)
      }
    })
  })
}
