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
  RelinkSourceKey,
  RelinkSourceOptions,
} from '../schema'
import { getAutomaticKey, registerKey, unregisterKey } from '../source-key'
import { createSuspenseWaiter, SuspenseWaiter } from '../suspense-waiter'
import { createServerBatcher, createVirtualBatcher } from '../virtual-batch'
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
  // Gate open ≠ dependencies are ready, it simply means that the current source
  // can finally hydrate itself.
  const hydrationGate = createGatedQueue(deps.length <= 0)
  // ^ Open the gate right away if there are no dependencies.

  // If virtual batching is disabled, then it is the same as if it is running
  // on a server. (Code get execute right away in servers).
  const batch = isVirtualBatchEnabled
    ? createVirtualBatcher()
    : createServerBatcher()

  const isDidResetProvided = isFunction(lifecycle.didReset)
  const isDidSetProvided = isFunction(lifecycle.didSet)
  const performUpdate = (type: PERF_UPDATE_TYPE, newState: S): void => {
    batch((): void => {
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

  // Note: when suspense hydration is complete, no need to batch update
  // because react is directly tracking the promise that is thrown, when
  // promise resolves, react automatically knows to attempt to render the
  // components again.

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
    hydrationGate.M$exec((): void => {
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

  const safeExecHydration = (): void => {
    if (isFunction(lifecycle.init)) {
      hydrate(lifecycle.init)
    }
  }

  // TODO: [HIGH]
  // Find out if hydration would be trigerred multiple times in a source that
  // has dependencies because of the first and subsequent runs.

  // This runs the first round of hydration for this source as soon as it is
  // deemed that it no longer has parent deps that are still hydrating.
  safeExecHydration()

  // This allows subsequent hydrations if any parent deps are being rehydrated
  // Watchers are used to make this possible
  const depWatchers: Array<() => void> = []
  for (const dep of deps) {
    dep[INTERNALS_SYMBOL].M$childDeps[normalizedKey] = true
    const unwatchDepHydration = dep[INTERNALS_SYMBOL]
      .M$hydrationWatcher.M$watch((isDepHydrating) => {
        if (isDepHydrating === true) {
          // Dependency is entering init status
          hydrationGate.M$setStatus(false)
          // Subsequent hydrations are queued here. Every time dependency
          // enters init status, it should be init-ed again after that/
          // Hence, `lifecycle.init` is added to the queue immediately ——
          // before other methods can be added to the queue.
          safeExecHydration()
          // Gate is closed before calling `gateExecHydration` so that hydration
          // is queued deferred until deps have finished hydrating.
        } else {
          if (allDepsAreReady()) {
            hydrationGate.M$setStatus(true)
          }
        }
      })
    depWatchers.push(unwatchDepHydration)
  }


  // === Exposed Methods ===

  const M$directGet = (): S => currentState

  const get = (): S => copyState(currentState) // (Expose)

  const set: RelinkSetter<S> = (partialState): void => {
    hydrationGate.M$exec(() => {
      performUpdate(PERF_UPDATE_TYPE.M$set, isFunction(partialState)
        ? partialState(copyState(currentState)) // (Expose)
        : partialState
      )
    })
  }

  const reset = (): void => {
    hydrationGate.M$exec(() => {
      performUpdate(PERF_UPDATE_TYPE.M$reset, initialState)
    })
  }

  // Declared as object as it is easier to add/remove the keys.
  const M$childDeps: Record<RelinkSourceKey, true> = {}

  // KIV:
  // We still haven't been able to find a way to check if sources are still in
  // use so that we can automatically clean them up, but since for most cases,
  // sources are used for as long as an app is opened, this can be temporarily
  // disregarded.
  const UNSTABLE_cleanup = (): void => {
    const childDepStack = Object.keys(M$childDeps)
    if (childDepStack.length !== 0) {
      devWarn(
        `Attempted to call \`${UNSTABLE_cleanup.name}()\` on ${normalizedKey}` +
        'while there are still other sources that depend on it: ' +
        childDepStack.join(', ')
      )
    }
    for (const dep of deps) {
      delete dep[INTERNALS_SYMBOL].M$childDeps[normalizedKey]
    }
    stateWatcher.M$unwatchAll()
    M$hydrationWatcher.M$unwatchAll()
    unregisterKey(normalizedKey)
    while (depWatchers.length > 0) {
      depWatchers.shift()() // Immediately invokes `unwatch()`
    }
  }

  return {
    [INTERNALS_SYMBOL]: {
      M$key: normalizedKey,
      M$isMutable: isSourceMutable,
      M$isPublic: isSourcePublic,
      M$parentDeps: deps,
      M$childDeps,
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
