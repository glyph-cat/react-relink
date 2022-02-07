import { RelinkSourceKey } from '../../schema'
import { isThenable } from '../type-checker'

/**
 * @internal
 */
type GatedCallback<V> = (...args: any[]) => V | Promise<V>

/**
 * @internal
 */
const dummyCallback = () => { } // eslint-disable-line @typescript-eslint/no-empty-function

/**
 * @internal
 */
export class GatedFlow {

  M$isOpen: boolean

  /**
   * Indicates whether flushing is currently happening.
   */
  M$isFlushing = false

  private M$queueStack: Array<[
    callback: GatedCallback<unknown>,
    resolver: (value: unknown | PromiseLike<unknown>) => void,
    rejector: (reason: unknown) => void
  ]> = []

  constructor(
    initialIsOpen: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: RelinkSourceKey
  ) {
    /**
     * If gate is open, it means queued callbacks can start flushing and new
     * callbacks passed to `M$exec` can be executed as soon as the flushing
     * completes.
     */
    this.M$isOpen = initialIsOpen
  }

  /**
   * Runs the queued callbacks but only if the gate is opened.
   */
  M$flush = async (): Promise<void> => {
    // Ignore request to flush if already flushing.
    if (this.M$isFlushing) { return } // Early exit
    // /**
    //  * A flag to indicate if an action is being executed in the while-loop.
    //  */
    // let isExecuting = false
    this.M$isFlushing = true
    while (this.M$isOpen && this.M$queueStack.length > 0) {
      const [poppedCallback, resolve, reject] = this.M$queueStack.shift()
      // if (isExecuting) {
      //   throw new Error(`'${String(key)}': Cyclic calls are not allowed.`)
      // }
      // isExecuting = true
      try {
        const payload = poppedCallback()
        const finalPayload = isThenable(payload) ? await payload : payload
        resolve(finalPayload)
      } catch (e) {
        reject(e)
      }
      // finally { isExecuting = false }
    }
    this.M$isFlushing = false
  }

  /**
   * Append a callback to the queue.
   */
  M$exec = <V>(callback: GatedCallback<V>): Promise<V> => {
    return new Promise((resolve, reject): void => {
      this.M$queueStack.push([callback, resolve, reject])
      this.M$flush()
      // ^ Let it be known that a flush has been requested, of course, it will
      // not matter if flushing is already in process. This is just in case it
      // is not.
    })
  }

  M$lockBase = (): void => {
    this.M$isOpen = false
  }

  /**
   * Closes the gate.
   */
  M$lock = (): Promise<void> => {
    // Promise is resolved only when this specific request to lock the gate has
    // been fulfilled.
    return this.M$exec(this.M$lockBase)
  }

  /**
   * Opens the gate.
   */
  M$open = (): Promise<void> => {
    // Promise is resolved only when this specific request to open the gate has
    // been fulfilled.
    return new Promise((resolve, reject) => {
      if (!this.M$isOpen) {
        this.M$isOpen = true
        this.M$flush()
        resolve()
      } else {
        for (let i = 0; i < this.M$queueStack.length; i++) {
          const [callback] = this.M$queueStack[i]
          if (Object.is(callback, this.M$lockBase)) {
            // Swap a dummy set inside so that this promise can be resolved.
            this.M$queueStack.splice(i, 1, [dummyCallback, resolve, reject])
            break
          }
        }
      }
    })
  }

}

// /**
//  * @internal
//  */
// export function createGatedFlow(
//   initialIsOpen: boolean,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   key: RelinkSourceKey
// ): GatedFlow {

//   /**
//    * If gate is open, it means queued callbacks can start flushing and new
//    * callbacks passed to `M$exec` can be executed as soon as the flushing
//    * completes.
//    */
//   let isOpen = initialIsOpen

//   /**
//    * Indicates whether flushing is currently happening.
//    */
//   let isFlushing = false

//   const queueStack: Array<[
//     callback: GatedCallback<unknown>,
//     resolver: (value: unknown | PromiseLike<unknown>) => void,
//     rejector: (reason: unknown) => void
//   ]> = []

//   const M$lockBase = (): void => { isOpen = false }

//   const M$getStatus = (): boolean => isOpen

//   /**
//    * Runs the queued callbacks but only if the gate is opened.
//    */
//   const M$flush = async (): Promise<void> => {
//     // Ignore request to flush if already flushing.
//     if (isFlushing) { return } // Early exit
//     // /**
//     //  * A flag to indicate if an action is being executed in the while-loop.
//     //  */
//     // let isExecuting = false
//     isFlushing = true
//     while (isOpen && queueStack.length > 0) {
//       const [poppedCallback, resolve, reject] = queueStack.shift()
//       // if (isExecuting) {
//       //   throw new Error(`'${String(key)}': Cyclic calls are not allowed.`)
//       // }
//       // isExecuting = true
//       try {
//         const payload = poppedCallback()
//         const finalPayload = isThenable(payload) ? await payload : payload
//         resolve(finalPayload)
//       } catch (e) {
//         reject(e)
//       }
//       // finally { isExecuting = false }

//     }
//     isFlushing = false
//   }

//   const M$exec = <V>(callback: GatedCallback<V>): Promise<V> => {
//     return new Promise((resolve, reject): void => {
//       queueStack.push([callback, resolve, reject])
//       M$flush()
//       // ^ Let it be known that a flush has been requested, of course, it will
//       // not matter if flushing is already in process. This is just in case it
//       // is not.
//     })
//   }

//   const M$open = (): Promise<void> => {
//     // Promise is resolved only when this specific request to open the gate has
//     // been fulfilled.
//     return new Promise((resolve, reject) => {
//       if (!isOpen) {
//         isOpen = true
//         M$flush()
//         resolve()
//       } else {
//         for (let i = 0; i < queueStack.length; i++) {
//           const [callback] = queueStack[i]
//           if (Object.is(callback, M$lockBase)) {
//             // Swap a dummy set inside so that this promise can be resolved.
//             queueStack.splice(i, 1, [dummyCallback, resolve, reject])
//             break
//           }
//         }
//       }
//     })
//   }

//   const M$lock = (): Promise<void> => {
//     // Promise is resolved only when this specific request to lock the gate has
//     // been fulfilled.
//     return M$exec(M$lockBase)
//   }

//   return {
//     M$exec,
//     M$getStatus,
//     M$lock,
//     M$open,
//   }

// }
