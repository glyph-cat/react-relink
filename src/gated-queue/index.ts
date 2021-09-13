import { CallbackWithNoParamAndReturnsVoid } from '../helper-types'

export interface GatedQueue {
  M$exec(callback: CallbackWithNoParamAndReturnsVoid): void
  M$setStatus(newStatus: boolean): void
  M$getStatus(): boolean
}

/**
 * A stack that either calls or queues callbacks depending on a flag.
 * Queued callbacks are first-in first-out.
 */
export function createGatedQueue(initialStatus = false): GatedQueue {
  let isOpen = initialStatus
  const queueStack: Array<CallbackWithNoParamAndReturnsVoid> = []
  const M$getStatus = (): boolean => isOpen
  const M$setStatus = (newStatus: boolean): void => {
    isOpen = newStatus
    if (newStatus === true) {
      while (queueStack.length > 0) {
        const queuedCallback = queueStack.shift()
        queuedCallback()
      }
    }
  }
  const M$exec = (callback: CallbackWithNoParamAndReturnsVoid): void => {
    isOpen ? callback() : queueStack.push(callback)
  }
  return {
    M$exec,
    M$setStatus,
    M$getStatus,
  }
}
