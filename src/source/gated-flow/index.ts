import { isThenable } from '../../type-checker'

type GatedCallback<V> = (...args: any[]) => V | Promise<V>

// TODO: Move to './src'

export interface GatedFlow {
  /**
   * Append a callback to the queue.
   */
  M$exec<V>(callback: GatedCallback<V>): Promise<V>
  /**
   * Get status of whether gate is currently opened or closed.
   */
  M$getStatus(): boolean
  /**
   * Closes the gate.
   */
  M$lock(): Promise<void>
  /**
   * Opens the gate.
   */
  M$open(): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const dummyCallback = () => { }

export function createGatedFlow(initialIsOpen: boolean): GatedFlow {

  /**
   * If gate is open, it means queued callbacks can start flushing and new
   * callbacks passed to `M$exec` can be executed as soon as the flushing
   * completes.
   */
  let isOpen = initialIsOpen

  /**
   * Indicates whether flushing is currently happening.
   */
  let isFlushing = false

  const queueStack: Array<[
    callback: GatedCallback<unknown>,
    resolver: (value: unknown | PromiseLike<unknown>) => void
  ]> = []

  const M$lockBase = (): void => { isOpen = false }

  const M$getStatus = (): boolean => isOpen

  /**
   * Runs the queued callbacks but only if the gate is opened.
   */
  const M$flush = async (): Promise<void> => {
    // Ignore request to flush if already flushing.
    if (isFlushing) { return } // Early exit
    isFlushing = true
    while (isOpen && queueStack.length > 0) {
      const [poppedCallback, resolve] = queueStack.shift()
      const payload = poppedCallback()
      const finalPayload = isThenable(payload) ? await payload : payload
      resolve(finalPayload)
    }
    isFlushing = false
  }

  const M$exec = <V>(callback: GatedCallback<V>): Promise<V> => {
    return new Promise((resolve): void => {
      queueStack.push([callback, resolve])
      M$flush()
      // ^ Let it be known that a flush has been requested, of course, it will
      // not matter if flushing is already in process. This is just in case it
      // is not.
    })
  }

  const M$open = (): Promise<void> => {
    // Promise is resolved only when this specific request to open the gate has
    // been fulfilled.
    return new Promise((resolve) => {
      if (!isOpen) {
        isOpen = true
        M$flush()
        resolve()
      } else {
        for (let i = 0; i < queueStack.length; i++) {
          const [callback] = queueStack[i]
          if (Object.is(callback, M$lockBase)) {
            // Swap a dummy set inside so that this promise can be resolved.
            queueStack.splice(i, 1, [dummyCallback, resolve])
            break
          }
        }
      }
    })
  }

  const M$lock = (): Promise<void> => {
    // Promise is resolved only when this specific request to lock the gate has
    // been fulfilled.
    return M$exec(M$lockBase)
  }

  return {
    M$exec,
    M$getStatus,
    M$lock,
    M$open,
  }

}
