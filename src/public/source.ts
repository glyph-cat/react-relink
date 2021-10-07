import { INTERNALS_SYMBOL } from '../constants'
import { allDepsAreReady } from '../private/all-deps-are-ready'
import { checkForCircularDeps } from '../private/circular-deps'
import { createRelinkCore, HYDRATION_SKIP_MARKER } from '../private/core'
import { createDebugLogger } from '../private/debug-logger'
import { devWarn } from '../private/dev'
import { TYPE_ERROR_SOURCE_KEY } from '../private/errors'
import { createGatedFlow } from '../private/gated-flow'
import {
  getAutomaticKey,
  registerKey,
  unregisterKey,
} from '../private/key-registry'
import {
  createNoUselessHydrationWarner,
  HydrationConcludeType,
} from '../private/no-useless-hydration-warner'
import { startMeasuringReducerPerformance } from '../private/performance'
import { safeStringJoin } from '../private/string-formatting'
import {
  RelinkEventType,
  RelinkSource,
  RelinkSourceEntry,
  RelinkSourceKey,
  RelinkSourceOptions,
} from '../schema'
import { createSuspenseWaiter, SuspenseWaiter } from '../private/suspense-waiter'
import { isFunction, isThenable } from '../private/type-checker'

// NOTE:
// Factory pattern is used throughout the codebase because class method names
// are not mangled by Terser, this causes problems in production build where
// variable name mangling takes place.

const DEFAULT_OPTIONS: RelinkSourceOptions = {
  mutable: true,
  public: false,
  suspense: false,
  virtualBatch: false,
} as const

let isSourceKeyAutogenWarningShown = false

/**
 * @public
 */
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
  if (typeofRawKey === 'string' ||
    typeofRawKey === 'number' ||
    typeofRawKey === 'symbol'
  ) {
    normalizedKey = rawKey
    if (rawKey === '') {
      devWarn('Did you just passed an empty string as a source key? Be careful, it can lead to problems that are hard to diagnose and debug later on.')
    }
  } else if (typeofRawKey === 'undefined') {
    normalizedKey = getAutomaticKey()
    if (!isSourceKeyAutogenWarningShown) {
      isSourceKeyAutogenWarningShown = true
      devWarn('Starting from V1, every source must have a unique key. This is because it helps simplify Relink\'s codebase and makes debugging easier for you at the same time. To facilitate this change, keys will be automatically generated at runtime for sources that do not already have one. This is only a temporary measure. Eventually, you will need to manually add in the keys.')
    }
    devWarn(`Automatically generated a source key: '${String(normalizedKey)}'`)
  } else {
    throw TYPE_ERROR_SOURCE_KEY(typeofRawKey)
  }

  registerKey(normalizedKey)
  const debugLogger = createDebugLogger(normalizedKey)


  // === Dependency Handling ===

  checkForCircularDeps(deps, [normalizedKey])

  /**
   * Gate being opened DOES NOT MEAN the source has been hydrated and is ready
   * to use, but rather, it means that the source can finally hydrate itself.
   * Also, gate is opened right away if there are no dependencies.
   */
  const gatedFlow = createGatedFlow(deps.length <= 0)

  let suspenseWaiter: SuspenseWaiter
  const M$suspenseOnHydration = (): void => {
    if (suspenseWaiter) {
      suspenseWaiter()
    }
  }


  // === Local Variables & Methods ===
  const mergedOptions = { ...DEFAULT_OPTIONS, ...rawOptions }
  const isSourceMutable = mergedOptions.mutable
  const isSourcePublic = mergedOptions.public
  const isVirtualBatchEnabled = mergedOptions.virtualBatch
  const isSuspenseEnabled = mergedOptions.suspense
  const core = createRelinkCore(defaultState, isSourceMutable, normalizedKey)


  // === Hydration ===

  /**
   * Self is not hydrating && deps are not hydrating.
   */
  const M$getIsReadyStatus = (): boolean => {
    return !core.M$getHydrationStatus() && allDepsAreReady(deps)
  }

  const hydrate: RelinkSource<S>['hydrate'] = (callback): Promise<void> => {
    core.M$hydrate(/* Empty means hydration is starting */)
    debugLogger.echo('Hydration requested')
    return gatedFlow.M$exec((): void | Promise<void> => {
      const concludeHydration = createNoUselessHydrationWarner(normalizedKey)
      debugLogger.echo('Beginning execution in gated flow')
      // TODO:
      // Try to not have different if-else blocks for suspense
      // Create a promise no matter what
      // Then, if `suspense:true`, assign that promise to `suspenseWaiter`
      if (isSuspenseEnabled) {
        const suspensePromise: Promise<void> = new Promise((resolve): void => {
          callback({
            commit(hydratedState: S): void {
              const isFirstHydration = concludeHydration(HydrationConcludeType.M$commit)
              if (isFirstHydration) {
                core.M$hydrate(hydratedState)
                resolve()
                suspenseWaiter = undefined
              }
            },
            skip(): void {
              const isFirstHydration = concludeHydration(HydrationConcludeType.M$skip)
              if (isFirstHydration) {
                core.M$hydrate(HYDRATION_SKIP_MARKER)
                resolve()
                suspenseWaiter = undefined
              }
            },
          })
        })
        suspenseWaiter = createSuspenseWaiter(suspensePromise)
        if (isThenable(suspensePromise)) {
          // Return the promise so that it can be await-ed
          return suspensePromise
        }
      } else {
        debugLogger.echo('isSuspenseEnabled: false')
        debugLogger.echo('Executing hydration callback')
        const executedCallback = callback({
          commit(hydratedState: S): void {
            const isFirstHydration = concludeHydration(HydrationConcludeType.M$commit)
            if (isFirstHydration) {
              core.M$hydrate(hydratedState)
            }
          },
          skip(): void {
            const isFirstHydration = concludeHydration(HydrationConcludeType.M$skip)
            if (isFirstHydration) {
              core.M$hydrate(core.M$get())
            }
          },
        })
        if (isThenable(executedCallback)) {
          debugLogger.echo('executedCallback is thenable? - YES')
          // Return the callback so that it can be await-ed
          return executedCallback
        } else {
          debugLogger.echo('executedCallback is thenable? - NO')
        }
      }
    })
  }

  // TOFIX:
  // `attemptHydration` and the `hydrate` function inside it are not await-ed
  // This is why `waitForAll` fails
  const attemptHydration = async (): Promise<void> => {
    debugLogger.echo('attemptHydration()')
    if (isFunction(lifecycle.init)) {
      debugLogger.echo('`lifecycle.init` is function')
      if (allDepsAreReady(deps)) {
        debugLogger.echo('allDepsAreReady: true // Hydrating with `lifecycle.init`…')
        hydrate(lifecycle.init)
      } else {
        debugLogger.echo('allDepsAreReady: false')
      }
    } else {
      debugLogger.echo('`lifecycle.init` is NOT a function')
    }
  }

  // This runs the first round of hydration for this source as soon as it is
  // deemed that it no longer has parent deps that are still hydrating.
  // If not all deps are ready, then the code will never run, instead, the one
  // in the for-loop where we add the watchers will. This is so that a source
  // doesn't end up hydrating twice meaninglessly. By right, watch handlers
  // should only receive ONE event from a source in this case
  // KIV/TODO: Write a test to make sure only ONE event is received.
  attemptHydration()

  // Watchers are used to allow subsequent hydrations if any parent deps are
  // being rehydrated.
  const depWatchers: Array<() => void> = []
  for (const dep of deps) {
    // Register child depenency to this source
    dep[INTERNALS_SYMBOL].M$childDeps[normalizedKey] = true
    const unwatchDepHydration = dep.watch((event) => {
      // Ignore if event is not caused by hydration
      if (event.type !== RelinkEventType.hydrate) { return }
      if (event.isHydrating) {
        // Lock gate to prevent further state changes.
        // gatedFlow.M$lock()
        // Let it be known that this source is (pending) hydrating
        core.M$hydrate(/* Empty means hydration is starting */)
      } else {
        // Open gate to resume queued state changes.
        // gatedFlow.M$open()
        // For each 'M$lock' called, a 'M$open' will be called when the dep
        // finishes hydrating. Gate will really be open when all locks are
        // cancelled out by the 'M$open' calls.

        // KIV
        // Gate is not locked so that pending state changes can complete and we
        // don't waste time waiting for them to hydrate the current source.
        // Although it might seem meaningless to execute queued state changes
        // knowing that they will be overriden by the new hydrated values, it is
        // important to know that there may be function called by the developer
        // that are await-ing for those state changes to be completed.
        attemptHydration()
      }
    })
    depWatchers.push(unwatchDepHydration)
  }


  // === Lifecycle ===
  // NOTE: When cleaning up, `M$unwatchAll` is called, so we don't need to worry
  // about unwatching here.
  if (isFunction(lifecycle.didSet)) {
    core.M$watch((event): void => {
      if (event.type === RelinkEventType.set) {
        lifecycle.didSet(event)
      }
    })
  }
  if (isFunction(lifecycle.didReset)) {
    core.M$watch((event): void => {
      if (event.type === RelinkEventType.reset) {
        lifecycle.didReset(event)
      }
    })
  }


  // === Exposed Methods ===

  const get = (): S => core.M$get()

  const getAsync = (): Promise<S> => {
    return gatedFlow.M$exec((): S => {
      return core.M$get()
    })
  }

  const set: RelinkSource<S>['set'] = (
    stateOrReducer: S | ((currentState: S) => S | Promise<S>)
  ): Promise<void> => {
    return gatedFlow.M$exec((): void | Promise<void> => {
      // let nextState: S
      if (isFunction(stateOrReducer)) {
        const perfMeasurer = startMeasuringReducerPerformance(normalizedKey)
        const executedReducer = stateOrReducer(core.M$get())
        // Refer to Local Note [A] near end of file
        if (isThenable(executedReducer)) {
          perfMeasurer.isAsync.current = true
          return new Promise((resolve) => {
            executedReducer.then((fulfilledPartialState) => {
              core.M$dynamicSet(fulfilledPartialState) // Is async reducer
              perfMeasurer.stop()
              resolve()
            }).catch((e) => { throw e }) // KIV: Is this a good approach?
          })
        } else {
          core.M$dynamicSet(executedReducer) // Is reducer
          perfMeasurer.stop()
        }
      } else {
        core.M$dynamicSet(stateOrReducer) // Is direct set
      }
    })
  }

  const reset = async (): Promise<void> => {
    return gatedFlow.M$exec((): void => {
      core.M$dynamicSet(/* Empty means reset */)
    })
  }

  // Declared as object as it is easier to add/remove the keys.
  const M$childDeps: Record<RelinkSourceKey, true> = {}

  // KIV:
  // We still haven't been able to find a way to check if sources are still in
  // use so that we can automatically clean them up, but since for most cases,
  // sources are used for as long as an app is opened, this can be temporarily
  // disregarded.
  const cleanup = (): void => {
    const childDepStack = Object.keys(M$childDeps)
    if (childDepStack.length !== 0) {
      devWarn(
        `Attempted to cleanup '${String(normalizedKey)}' while there are ` +
        'still other sources that depend on it: ' +
        `'${safeStringJoin(childDepStack, '\', \'')}'.`
      )
    }
    for (const dep of deps) {
      // Unregister child depenency from this source
      delete dep[INTERNALS_SYMBOL].M$childDeps[normalizedKey]
    }
    core.M$unwatchAll()
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
      M$isVirtualBatchEnabled: isVirtualBatchEnabled,
      M$parentDeps: deps,
      M$childDeps,
      M$directGet: core.M$directGet,
      M$suspenseOnHydration,
      M$getIsReadyStatus,
    },
    get,
    getAsync,
    set,
    reset,
    hydrate,
    watch: core.M$watch,
    cleanup,
  }

}

// === Local Notes ===
// [A] This allows the execution to be synchronous if the reducer is also
//     synchronous. Consider the code below:
//     ```js
//     nextState = isThenable(executedReducer)
//       ? await executedReducer
//       : executedReducer
//     ```
//
//     This would make the execution asynchronous regardless of whether or not
//     the reducer is asynchronous and code would look like this:
//     ```js
//     .M$exec(async (): Promise<void> => { ...
//     ```
//
//     And for unclear reasons, this creates a delay in integration tests that
//     would result in inaccurate assertions. At the same time, if, by
//     conditionally making the execution asynchronous eliminates unnecessary
//     delay, this also means we get a little bit of performance gain.
