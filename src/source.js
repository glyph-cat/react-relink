import batchedUpdates from './batch'
import { checkForCircularDepsAndGetKeyStack } from './circular-deps'
import deepCopy from './deep-copy'
import { deprecationWarn, devPrint } from './dev'
import { createGatedQueue } from './gated-queue'
import { createListener } from './listener'
import { createSuspenseWaiter } from './suspense-waiter'
import virtualBatch from './virtual-batch'

// NOTE:
// Factory pattern is used throughout the codebase because class method names are not mangled by
// Terser, this causes problems in production build where variable name mangling takes place

const RELINK_SOURCE_SIGNATURE = {}

let internalIdCounter = 1

export function createSource(specs) {
  const {
    key,
    deps = {},
    default: defaultState,
    lifecycle = {},
    options = {},
  } = specs

  const M$internalId = internalIdCounter++
  const depsKeyStack = checkForCircularDepsAndGetKeyStack(M$internalId, deps)

  const allDepsAreReady = () => {
    for (const depKey of depsKeyStack) {
      const dep = deps[depKey]
      if (!dep.M$getIsReadyStatus()) {
        return false // Early exit
      }
    }
    return true
  }

  /**
   * @description State should be wrapped in this function whenever
   * it is received from or exposed to code outside of this library
   *
   * Every line of code that uses this method should also have a
   * "// (Receive)" or "// (Receive)" comment added to the end
   * For example: state = copyState(newState); // (Receive)
   */
  const copyState = (s) => (options.mutable ? s : deepCopy(s))

  const initialState = copyState(defaultState) // (Receive)
  let state = copyState(defaultState) // (Receive)
  let shadowState // Assignment deferred until first set occurs
  let isFirstSetOccured = false

  // Open the gate right away if there are no dependencies
  // NOTE: Gate open ≠ dependencies are ready, it simply means that
  // the current source can finally hydrate itself
  const gate = createGatedQueue(depsKeyStack.length <= 0)

  const internalBatch = options.virtualBatch
    ? (callback) => {
      virtualBatch(() => {
        batchedUpdates(callback)
      })
    }
    : batchedUpdates

  const performUpdate = (type, newState) => {
    const isReset = type === 1
    const isHydrate = type === 2
    shadowState = copyState(newState) // (Receive)
    internalBatch(() => {
      state = copyState(newState) // (Receive)
      M$listener.M$refresh()
      const isDidResetProvided = typeof lifecycle.didReset === 'function'
      const isDidSetProvided = typeof lifecycle.didSet === 'function'
      if (isReset) {
        if (isDidResetProvided) {
          lifecycle.didReset()
        }
      } else if (!isHydrate) {
        if (isDidSetProvided) {
          lifecycle.didSet({ state: copyState(state) }) // (Expose)
        }
      }
    })
  }

  // Note: when suspense hydration is complete, no need to batch
  // update because react is directly tracking the promise that
  // is thrown, when promise resolves, react automatically knows
  // to attempt to render the components again

  const M$listener = createListener()
  const initListener = createListener()

  let suspenseWaiter
  let isHydrating = false
  const hydrate = (callback) => {
    if (isHydrating) {
      devPrint(
        'error',
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
            state = copyState(payload) // (Receive)
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

  const get = () => copyState(state) // (Expose)

  const set = (partialState) => {
    gate.M$exec(() => {
      if (!isFirstSetOccured) {
        shadowState = copyState(state) // (Receive)
        isFirstSetOccured = true
      }
      performUpdate(
        undefined,
        copyState(
          typeof partialState === 'function'
            ? partialState(copyState(shadowState)) // (Expose)
            : partialState
        ) // (Receive)
      )
    })
  }

  const reset = () => {
    gate.M$exec(() => {
      performUpdate(1, initialState)
    })
  }

  const addListener = (callback) => {
    deprecationWarn('listener', 'Use `.watch` instead of `.addListener`')
    return M$listener.M$add(() => {
      callback(get())
    })
  }

  const watch = (callback) => {
    const id = M$listener.M$add(() => {
      callback(get())
    })
    return () => {
      M$listener.M$remove(id)
    }
  }

  // TODO: Hide internals with a Symbol
  return {
    M$signature: RELINK_SOURCE_SIGNATURE,
    M$internalId,
    M$key: key,
    M$deps: deps,
    M$addInitListener: initListener.M$add,
    M$removeInitListener: initListener.M$remove,
    M$listener,
    addListener,
    removeListener: M$listener.M$remove,
    watch,
    hydrate,
    M$suspenseOnHydration,
    M$isMutable: options.mutable,
    /**
     * Self is not hydrating && Deps are not hydrating
     */
    M$getIsReadyStatus: () => !isHydrating && allDepsAreReady(),
    M$getDirectState: () => state,
    get,
    set,
    reset,
  }
}

export function isRelinkSource(value) {
  if (!value) {
    return false
  } else {
    return value.M$signature === RELINK_SOURCE_SIGNATURE
  }
}
