import * as __relink__ from '../src'
import { RelinkEvent, RelinkSource } from '../src'

export interface IntegrationTestConfig {
  buildType: 'cjs' | 'es' | 'umd'
  buildEnv: 'debug' | 'dev' | 'prod'
  description: string
  Relink: typeof __relink__
}

export interface SampleSchema {
  foo: number,
  bar: number,
}

/**
 * The minimal time delay unit used in tests.
 */
export const TIME_GAP = (unit: number): number => 20 * unit // ms

export function delay(timeout: number): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout(resolve, timeout)
  })
}

// export function mockDatabase() { }

// export interface PromiseRef<V = unknown, X = unknown> {
//   resolve(value: V): void
//   reject(reason: X): void
// }

// export function createPromiseRef<V = unknown, X = unknown>(): PromiseRef<V, X> {
//   const ref = {
//     promise: null,
//     resolve: null,
//     reject: null,
//   }
//   ref.promise = new Promise((resolve, reject) => {
//     ref.resolve = resolve
//     ref.reject = reject
//   })
//   return ref
// }

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
