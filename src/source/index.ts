import batchedUpdates from '../batch'
import { checkForCircularDepsAndGetKeyStack } from '../circular-deps'
import { INTERNALS_SYMBOL } from '../constants'
import deepCopy from '../deep-copy'
import { devError } from '../dev'
import { createGatedQueue } from '../gated-queue'
import { RelinkSource, RelinkSourceEntry } from '../schema'
import { createSuspenseWaiter } from '../suspense-waiter'
import { createVirtualBatcher, VirtualBatchedCallback } from '../virtual-batch'
import { createWatcher, Watcher } from '../watcher'

// NOTE:
// Factory pattern is used throughout the codebase because class method names
// are not mangled by Terser, this causes problems in production build where
// variable name mangling takes place

let internalIdCounter = 1

interface RelinkSourceInternalInstance<T> {
  M$watcher: Watcher<any>
  M$internalId: number
  M$copyState<S>(s: S): S
}

export function createSource<T>(specs: RelinkSourceEntry<T>): RelinkSource<T> {

  const {
    key,
    deps = {},
    default: defaultState,
    lifecycle = {},
    options = {},
  } = specs

  const self: RelinkSourceInternalInstance<T> = {
    M$watcher: createWatcher<any>(),
    M$internalId: internalIdCounter++,
    /**
     * State should be wrapped in this function whenever it is received from or
     * exposed to code outside of this library.
     *
     * Every line of code that uses this method should also have a "// (Receive)"
     * or "// (Receive)" comment added to the end.
     * For example: state = copyState(newState); // (Receive)
     */
    M$copyState: <S>(s: S): S => options.mutable ? s : deepCopy(s),
  }

  const depsKeyStack = checkForCircularDepsAndGetKeyStack(self.M$internalId, deps)

  const allDepsAreReady = () => {
    for (const depKey of depsKeyStack) {
      const dep = deps[depKey]
      if (!dep.M$getIsReadyStatus()) {
        return false // Early exit
      }
    }
    return true
  }

  const initialState = self.M$copyState(defaultState) // (Receive)
  let state = self.M$copyState(defaultState) // (Receive)
  let shadowState // Assignment deferred until first set occurs
  let isFirstSetOccured = false

  // Open the gate right away if there are no dependencies
  // NOTE: Gate open ≠ dependencies are ready, it simply means that
  // the current source can finally hydrate itself
  const gate = createGatedQueue(depsKeyStack.length <= 0)

  const internalBatch = (() => {
    if (options.virtualBatch) {
      const virtualbatch = createVirtualBatcher()
      return (callback: VirtualBatchedCallback) => {
        virtualbatch(() => {
          batchedUpdates(callback)
        })
      }
    } else {
      return batchedUpdates
    }
  })()

  const performUpdate = (type, newState) => {
    const isReset = type === 1
    const isHydrate = type === 2
    shadowState = self.M$copyState(newState) // (Receive)
    internalBatch(() => {
      state = self.M$copyState(newState) // (Receive)
      M$listener.M$refresh()
      const isDidResetProvided = typeof lifecycle.didReset === 'function'
      const isDidSetProvided = typeof lifecycle.didSet === 'function'
      if (isReset) {
        if (isDidResetProvided) {
          lifecycle.didReset()
        }
      } else if (!isHydrate) {
        if (isDidSetProvided) {
          lifecycle.didSet({ state: self.M$copyState(state) }) // (Expose)
        }
      }
    })
  }

  // Note: when suspense hydration is complete, no need to batch
  // update because react is directly tracking the promise that
  // is thrown, when promise resolves, react automatically knows
  // to attempt to render the components again

  let suspenseWaiter
  let isHydrating = false
  const hydrate = (callback) => {
    if (isHydrating) {
      devError(
        'Cannot hydrate source when it is already hydrating' +
        (key ? `(in "${key}")` : '')
      )
      return
    } // Early exit
    isHydrating = true
    if (options.suspense) {
      suspenseWaiter = createSuspenseWaiter(
        new Promise((resolve) => {
          const commit = (payload) => {
            // NOTE: `performUpdate` is not called here because components
            // will be re-rendered anyway when the promise resolved.
            // The state, however, must be copied
            state = self.M$copyState(payload) // (Receive)
            resolve()
            suspenseWaiter = undefined
            isHydrating = false
            initListener.M$refresh(0)
          }
          initListener.M$refresh(1)
          callback({ commit })
        })
      )
    } else {
      const commit = (payload) => {
        performUpdate(2, payload)
        isHydrating = false
        initListener.M$refresh(0)
      }
      initListener.M$refresh(1)
      callback({ commit })
    }
  }

  const gateExecHydration = () => {
    gate.M$exec(() => {
      if (typeof lifecycle.init === 'function') {
        hydrate(lifecycle.init)
      }
    })
  }

  // Hydration must run at least once if lifecycle.init is provided
  gateExecHydration()

  // If there are deps, add listeners so that we know when to hydrate this source again
  if (depsKeyStack.length > 0) {
    for (const depKey of depsKeyStack) {
      const dep = deps[depKey]
      dep.M$addInitListener((type) => {
        if (type === 1) {
          // Dependency is entering init status
          gate.M$setStatus(false)
          // Subsequent hydrations are queued here. Every time dependency enters init status, it
          // should be init-ed again after that Hence, `lifecycle.init` is added to the queue
          // immediately —— before other methods can be added to the queue
          gateExecHydration()
          // NOTE: Gate is closed before calling `gateExecHydration` so that hydration is queued
          // deferred until deps have finished hydrating
        } else {
          // Dependency has finished init status
          if (allDepsAreReady()) {
            gate.M$setStatus(true)
          }
        }
      })
    }
  }

  // === Exposed methods ===

  const M$suspenseOnHydration = () => {
    if (suspenseWaiter) {
      suspenseWaiter()
    }
  }

  const get = (): T => self.M$copyState(state) // (Expose)

  const set = (partialState): void => {
    gate.M$exec(() => {
      if (!isFirstSetOccured) {
        shadowState = self.M$copyState(state) // (Receive)
        isFirstSetOccured = true
      }
      performUpdate(
        undefined,
        self.M$copyState(
          typeof partialState === 'function'
            ? partialState(self.M$copyState(shadowState)) // (Expose)
            : partialState
        ) // (Receive)
      )
    })
  }

  const reset = (): void => {
    gate.M$exec(() => {
      performUpdate(1, initialState)
    })
  }

  const sourceInstance: RelinkSource<T> = {
    get,
    set,
    reset,
    hydrate,
    watch: self.M$watcher.M$watch,
    [INTERNALS_SYMBOL]: {
      M$internalId,
      M$key: key,
      M$deps: deps,
      M$addInitListener: initListener.M$add,
      M$removeInitListener: initListener.M$remove,
      M$suspenseOnHydration,
      M$isMutable: options.mutable,
      /**
       * Self is not hydrating && Deps are not hydrating
       */
      M$getIsReadyStatus: () => !isHydrating && allDepsAreReady(),
      M$getDirectState: () => state,
    },
  }

  return sourceInstance

}

export function isRelinkSource(value: unknown): boolean {
  // NOTE: Must do preliminary check. If value is undefined, trying to directly
  // access `value[INTERNALS_SYMBOL]` would've resulted in an error.
  if (!value) { return false } // Early exit
  return typeof value[INTERNALS_SYMBOL] !== 'undefined'
}
