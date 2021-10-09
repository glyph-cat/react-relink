import { INTERNALS_SYMBOL, IS_DEV_ENV } from '../../constants'
import { createDebugLogger } from '../../debugging'
import { allDepsAreReady } from '../../internals/all-deps-are-ready'
import { checkForCircularDeps } from '../../internals/circular-deps'
import {
  createRelinkCore,
  HYDRATION_SKIP_MARKER,
} from '../../internals/core'
import { devError, devWarn } from '../../internals/dev'
import {
  getWarningForForwardedHydrationCallbackValue,
  TYPE_ERROR_SOURCE_KEY,
} from '../../internals/errors'
import { createGatedFlow } from '../../internals/gated-flow'
import {
  getAutomaticKey,
  registerKey,
  unregisterKey,
} from '../../internals/key-registry'
import {
  createNoUselessHydrationWarner,
  HydrationConcludeType,
} from '../../internals/no-useless-hydration-warner'
import { startMeasuringReducerPerformance } from '../../internals/performance'
import { safeStringJoin } from '../../internals/string-formatting'
import {
  RelinkEventType,
  RelinkSource,
  RelinkSourceEntry,
  RelinkSourceKey,
  RelinkSourceOptions,
} from '../../schema'
import { isFunction, isThenable } from '../../internals/type-checker'

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

let isWarningShown_sourceKeyAutogen = false // KIV
let isWarningShown_suspenseNotSupported = false // KIV

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
    if (!isWarningShown_sourceKeyAutogen) {
      isWarningShown_sourceKeyAutogen = true
      devWarn('Starting from V1, every source must have a unique key. This is because it helps simplify Relink\'s codebase and makes debugging easier for you at the same time. To facilitate this change, keys will be automatically generated at runtime for sources that do not already have one. This is only a temporary measure. Eventually, you will need to manually add in the keys.')
    }
    devWarn(`Automatically generated a source key: '${String(normalizedKey)}'`)
  } else {
    throw TYPE_ERROR_SOURCE_KEY(typeofRawKey)
  }

  registerKey(normalizedKey)
  const debugLogger = createDebugLogger(normalizedKey)
  checkForCircularDeps(deps, [normalizedKey])


  // === Local Variables & Methods ===
  /**
   * Gate being opened DOES NOT MEAN the source has been hydrated and is ready
   * to use, but rather, it means that the source can finally hydrate itself.
   * Also, gate is opened right away if there are no dependencies.
   */
  const gatedFlow = createGatedFlow(deps.length <= 0)
  const mergedOptions = { ...DEFAULT_OPTIONS, ...rawOptions }
  const isSourceMutable = mergedOptions.mutable
  const isSourcePublic = mergedOptions.public
  const isVirtualBatchEnabled = mergedOptions.virtualBatch
  const isSuspenseEnabled = mergedOptions.suspense
  const core = createRelinkCore(defaultState, isSourceMutable, normalizedKey)

  if (mergedOptions.suspense) {
    if (!isWarningShown_suspenseNotSupported) {
      isWarningShown_suspenseNotSupported = true
      devError('Suspense for data fetching is currently not supported. For now, it\'s safer to assume that this feature will only be reimplemented in Relink at a later date, presumably when this feature is considered stable from React.')
    }
  }


  // === Hydration ===

  /**
   * Self is not hydrating && deps are not hydrating.
   */
  const M$getIsReadyStatus = (): boolean => {
    // NOTE: If this source's `lifecycle.init` is not provided, `isHydrating`
    // should always be false.
    const isHydrating = core.M$getIsHydrating()
    const areAllDepsReallyReady = allDepsAreReady(deps)
    const isReady = !isHydrating && areAllDepsReallyReady
    debugLogger.echo(`(M$getIsReadyStatus) isHydrating: ${isHydrating}, areAllDepsReallyReady: ${areAllDepsReallyReady}, isReady: ${isReady}`)
    return isReady
  }

  const hydrate: RelinkSource<S>['hydrate'] = (callback): Promise<void> => {
    core.M$hydrate(/* Empty means hydration is starting */)
    debugLogger.echo('Hydration requested')
    return gatedFlow.M$exec((): void | Promise<void> => {
      debugLogger.echo('Begin executing hydration callback in gated flow')
      const concludeHydration = createNoUselessHydrationWarner(normalizedKey)

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
            core.M$hydrate(HYDRATION_SKIP_MARKER)
          }
        },
      })

      // NOTE: `executedCallback` can be either `Promise<void>` or `void` based
      // how developers declare the hydration callback. This making await-ing
      // for hydration automatically possible but creates a potential problem.
      // Hydration callbacks are supposed to return `Promise<undefined>` or
      // `undefined`. There's a small chance that developers might run into some
      // problem and need an escape hatch and end up trying to await for data
      // from this callback.
      if (IS_DEV_ENV) {
        if (isThenable(executedCallback)) {
          executedCallback.then((executedCallbackPayload) => {
            const typeofExecutedCallbackPayload = typeof executedCallbackPayload
            if (typeofExecutedCallbackPayload !== 'undefined') {
              devWarn(getWarningForForwardedHydrationCallbackValue(typeofExecutedCallbackPayload))
            }

          })
        } else {
          const typeofExecutedCallback = typeof executedCallback
          if (typeofExecutedCallback !== 'undefined') {
            devWarn(getWarningForForwardedHydrationCallbackValue(typeofExecutedCallback))
          }
        }
      }

      return executedCallback
    })
  }

  const attemptHydration = async (): Promise<void> => {
    debugLogger.echo('attemptHydration()')
    debugLogger.echo(`Are parent deps hydration complete: ${allDepsAreReady(deps)}`)
    debugLogger.echo(`Is self hydration complete: ${core.M$getIsHydrating()}`)
    if (isFunction(lifecycle.init)) {
      debugLogger.echo('`lifecycle.init` is function')
      await hydrate(lifecycle.init)
    } else {
      debugLogger.echo('`lifecycle.init` is NOT a function')
    }
  }

  // KIV/TODO: Write a test to ensure this behaviour.
  // This runs the first round of hydration for this source ASAP, even before
  // all deps are ready. This is because some applications might want to hydrate
  // from a local storage first, then fetch data from server and attempt another
  // hydration after a few moments just to make sure the state is up to date.
  // This is why watchers are used to allow subsequent hydrations if any parent
  // deps are being rehydrated or just being hydrated for the first time.
  attemptHydration()

  const depWatchers: Array<() => void> = []
  for (const dep of deps) {
    // Register child depenency to this source
    dep[INTERNALS_SYMBOL].M$childDeps[normalizedKey] = true
    const unwatchDepHydration = dep.watch((event) => {
      // Ignore if event is not caused by hydration
      if (event.type !== RelinkEventType.hydrate) { return }
      debugLogger.echo(`💚 depWatchers received hydration event from '${String(dep[INTERNALS_SYMBOL].M$key)}' (isHydrating: ${event.isHydrating})`)
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
        if (allDepsAreReady(deps)) {
          debugLogger.echo('allDepsAreReady: true // Calling `attemptHydration()`…')
          attemptHydration()
        } else {
          debugLogger.echo('allDepsAreReady: false')
        }
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
    // Check if there are any child dependants and proceed to cleanup anyway,
    // but show a warning if there are child dependants so that developers will
    // be aware that there might be unintended behaviours.
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
      M$isSuspenseEnabled: isSuspenseEnabled,
      M$isVirtualBatchEnabled: isVirtualBatchEnabled,
      M$parentDeps: deps,
      M$childDeps,
      M$directGet: core.M$directGet,
      // M$suspenseOnHydration,
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