import { IS_BROWSER_ENV } from '../constants'

export type VirtualBatchedCallback = (...args: Array<unknown>) => unknown

export type VirtualBatchFunction = (callback: VirtualBatchedCallback) => void

export function createBrowserBatcher(): VirtualBatchFunction {
  let debounceRef: ReturnType<typeof setTimeout>
  const deferredCallbackStack: Array<VirtualBatchedCallback> = []
  return (callback: VirtualBatchedCallback) => {
    clearTimeout(debounceRef)
    deferredCallbackStack.push(callback)
    debounceRef = setTimeout(() => {
      while (deferredCallbackStack.length > 0) {
        // Returned item is a function, since there's nothing extra to do
        // with it, the function is invoked right away.
        deferredCallbackStack.shift()()
      }
    })
  }
}

export function createServerBatcher(): VirtualBatchFunction {
  return (callback: VirtualBatchedCallback) => { callback() }
}

export function createVirtualBatcher(): VirtualBatchFunction {
  return IS_BROWSER_ENV ? createBrowserBatcher() : createServerBatcher()
}
