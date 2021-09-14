import { checkForCircularDeps } from '../circular-deps'
import { INTERNALS_SYMBOL } from '../constants'
import deepCopy from '../deep-copy'
import { devError, devWarn } from '../dev'
import { TYPE_ERROR_SOURCE_KEY } from '../errors'
import { createGatedQueue } from '../gated-queue'
import { isFunction } from '../is-function'
import {
  RelinkSetter,
  RelinkHydrator,
  RelinkSource,
  RelinkSourceEntry,
  RelinkStateDerivator,
  RelinkSourceKey,
  RelinkSourceOptions,
} from '../schema'
import { getAutomaticKey, registerKey, unregisterKey } from '../source-key'
import { createSuspenseWaiter, SuspenseWaiter } from '../suspense-waiter'
import { createVirtualBatcher, VirtualBatchedCallback } from '../virtual-batch'
import { waitForAll } from '../wait-for'
import { createWatcher } from '../watcher'

// NOTE:
// Factory pattern is used throughout the codebase because class method names
// are not mangled by Terser, this causes problems in production build where
// variable name mangling takes place

enum PERF_UPDATE_TYPE {
  M$set = undefined,
  M$reset = 1,
  M$hydrate = 2,
}

const DEFAULT_OPTIONS: RelinkSourceOptions = {
  mutable: true,
  public: false,
  suspense: false,
  virtualBatch: false,
} as const

export function createSource<S>({
  key: rawKey,
  deps = [],
  default: defaultState,
  lifecycle = {},
  options: rawOptions,
}: RelinkSourceEntry<S>): RelinkSource<S> {

  // === Key checking ===
  let normalizedKey: RelinkSourceKey
  const typeofRawKey = typeof rawKey
  if (typeofRawKey === 'string' || typeofRawKey === 'number') {
    normalizedKey = rawKey
  } else if (typeofRawKey === 'undefined') {
    normalizedKey = getAutomaticKey()
    devWarn(
      'No key provided to source, ' +
      `automatically generating one: '${normalizedKey}'`
    )
  } else {
    throw TYPE_ERROR_SOURCE_KEY(typeofRawKey)
  }
  registerKey(normalizedKey)

  // === Local Variables & Methods ===

  const mergedOptions = { ...DEFAULT_OPTIONS, ...rawOptions }
  const isSourceMutable = mergedOptions.mutable
  const isSourcePublic = mergedOptions.public
  const isVirtualBatchEnabled = mergedOptions.virtualBatch
  const isSuspenseEnabled = mergedOptions.suspense

  /**
   * State should be wrapped in this function whenever it is received from or
   * exposed to code outside of this library.
   *
   * Every line of code that uses this method should also have a "// (Expose)"
   * or "// (Receive)" comment added to the end.
   * For example: state = copyState(newState); // (Receive)
   */
  const copyState = (s: S): S => isSourceMutable ? s : deepCopy(s)
  const initialState: S = copyState(defaultState) // (Receive)
  let currentState: S = copyState(defaultState) // (Receive)
  const stateWatcher = createWatcher<never>()

  // === Dependency Handling ===
  checkForCircularDeps(deps, [normalizedKey])
  const allDepsAreReady = (): boolean => {
    for (let i = 0; i < deps.length; i++) {
      if (!deps[i][INTERNALS_SYMBOL].M$getIsReadyStatus()) {
        return false // Early exit
      }
    }
    return true
  }
  // Open the gate right away if there are no dependencies
  // NOTE: Gate open ≠ dependencies are ready, it simply means that
  // the current source can finally hydrate itself
  const ancestorGate = createGatedQueue(deps.length <= 0)

  const batch = (() => {
    if (isVirtualBatchEnabled) {
      const virtualbatch = createVirtualBatcher()
      return (callback: VirtualBatchedCallback): void => {
        virtualbatch(callback)
      }
    } else {
      return (callback: VirtualBatchedCallback): void => {
        callback()
      }
    }
  })()

  const isDidResetProvided = isFunction(lifecycle.didReset)
  const isDidSetProvided = isFunction(lifecycle.didSet)
  const performUpdate = (type: PERF_UPDATE_TYPE, newState: S) => {
    batch(() => {
      currentState = copyState(newState) // (Receive)
      if (type === PERF_UPDATE_TYPE.M$reset) {
        if (isDidResetProvided) {
          lifecycle.didReset()
        }
      } else if (type !== PERF_UPDATE_TYPE.M$hydrate) {
        if (isDidSetProvided) {
          lifecycle.didSet({
            state: copyState(currentState), // (Expose)
          })
        }
      }
      stateWatcher.M$refresh()
    })
  }

  // Note: when suspense hydration is complete, no need to batch
  // update because react is directly tracking the promise that
  // is thrown, when promise resolves, react automatically knows
  // to attempt to render the components again

  let suspenseWaiter: SuspenseWaiter
  let isHydrating = false
  const M$hydrationWatcher = createWatcher<[boolean]>() // true = is hydrating

  const M$suspenseOnHydration = (): void => {
    if (suspenseWaiter) {
      suspenseWaiter()
    }
  }


  // === Hydration ===

  const hydrate: RelinkHydrator<S> = (callback): void => {
    ancestorGate.M$exec(() => {
      if (isHydrating) {
        devError(`Cannot hydrate '${normalizedKey}' when it is already hydrating`)
        return // Early exit
      }
      isHydrating = true
      if (isSuspenseEnabled) {
        suspenseWaiter = createSuspenseWaiter(
          new Promise((resolve) => {
            const commit = (hydratedState: S): void => {
              performUpdate(PERF_UPDATE_TYPE.M$hydrate, hydratedState)
              resolve()
              suspenseWaiter = undefined
              isHydrating = false
              M$hydrationWatcher.M$refresh(false)
            }
            M$hydrationWatcher.M$refresh(true)
            callback({ commit })
          })
        )
      } else {
        const commit = (hydratedState: S): void => {
          performUpdate(PERF_UPDATE_TYPE.M$hydrate, hydratedState)
          isHydrating = false
          M$hydrationWatcher.M$refresh(false)
        }
        M$hydrationWatcher.M$refresh(true)
        callback({ commit })
      }
    })
  }

  if (isFunction(lifecycle.init)) {
    const selfInvokingInitFn = async () => {
      if (deps.length > 0) {
        await waitForAll(deps)
      }
      hydrate(lifecycle.init)
    }; selfInvokingInitFn()
  }


  // === Exposed Methods ===

  const M$directGet = (): S => currentState

  const get = (): S => copyState(currentState) // (Expose)

  const set: RelinkSetter<S> = (partialState): void => {
    // TODO: Gate control to wait until no hydrating
    performUpdate(PERF_UPDATE_TYPE.M$set, isFunction(partialState)
      ? (partialState as RelinkStateDerivator<S>)(copyState(currentState)) // (Expose)
      : partialState
    )
  }

  const reset = (): void => {
    // TODO: Gate control to wait until no hydrating
    performUpdate(PERF_UPDATE_TYPE.M$reset, initialState)
  }

  // KIV: We still haven't been able to find a way to check if sources are still
  // in use so that we can clean them up, but since for most cases, sources are
  // used for as long as an app is opened, this can be temporarily neglected.
  const UNSTABLE_cleanup = (): void => {
    stateWatcher.M$unwatchAll()
    M$hydrationWatcher.M$unwatchAll()
    unregisterKey(normalizedKey)
  }

  return {
    [INTERNALS_SYMBOL]: {
      M$key: normalizedKey,
      M$isMutable: isSourceMutable,
      M$isPublic: isSourcePublic,
      M$deps: deps,
      M$directGet,
      M$suspenseOnHydration,
      M$hydrationWatcher,
      /**
       * Self is not hydrating && Deps are not hydrating
       */
      M$getIsReadyStatus: () => !isHydrating && allDepsAreReady(),
    },
    get,
    set,
    reset,
    hydrate,
    watch: stateWatcher.M$watch,
    UNSTABLE_cleanup,
  }

}

export function isRelinkSource<S = unknown>(
  value: unknown
): value is RelinkSource<S> {
  // NOTE: Must do preliminary check. If value is undefined, trying to directly
  // access `value[INTERNALS_SYMBOL]` would've resulted in an error.
  if (!value) { return false } // Early exit
  return typeof value[INTERNALS_SYMBOL] !== 'undefined'
}
