import { INTERNALS_SYMBOL } from '../constants'
import { $$createRelinkCore } from '../core'
import { devWarn } from '../dev'
import { TYPE_ERROR_SOURCE_KEY } from '../errors'
import {
  createNoUselessHydrationWarner,
  HydrationConcludeType,
} from '../no-useless-hydration-warner'
import {
  RelinkEventType,
  RelinkSource,
  RelinkSourceEntry,
  RelinkSourceKey,
  RelinkSourceOptions,
} from '../schema'
import { createSuspenseWaiter, SuspenseWaiter } from '../suspense-waiter'
import { isFunction, isThenable } from '../type-checker'
import { allDepsAreReady } from './all-deps-are-ready'
import { checkForCircularDeps } from './circular-deps'
import { createGatedFlow } from './gated-flow'
import { getAutomaticKey, registerKey, unregisterKey } from './key-registry'

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
  const core = $$createRelinkCore(defaultState, isSourceMutable)


  // === Hydration ===

  /**
   * Self is not hydrating && deps are not hydrating.
   */
  const M$getIsReadyStatus = (): boolean => {
    return !core.M$getHydrationStatus() && allDepsAreReady(deps)
  }

  const hydrate: RelinkSource<S>['hydrate'] = (callback): Promise<void> => {
    core.M$hydrate(/* Empty means hydration is starting */)
    return gatedFlow.M$exec((): void => {
      const concludeHydration = createNoUselessHydrationWarner(normalizedKey)
      if (isSuspenseEnabled) {
        suspenseWaiter = createSuspenseWaiter(
          new Promise((resolve): void => {
            callback({
              commit(hydratedState: S): void {
                const isFirstHydration = concludeHydration(HydrationConcludeType.commit)
                if (isFirstHydration) {
                  core.M$hydrate(hydratedState)
                  resolve()
                  suspenseWaiter = undefined
                }
              },
              skip(): void {
                const isFirstHydration = concludeHydration(HydrationConcludeType.skip)
                if (isFirstHydration) {
                  core.M$hydrate(core.M$get())
                  resolve()
                  suspenseWaiter = undefined
                }
              },
            })
          })
        )
      } else {
        callback({
          commit(hydratedState: S): void {
            const isFirstHydration = concludeHydration(HydrationConcludeType.commit)
            if (isFirstHydration) {
              core.M$hydrate(hydratedState)
            }
          },
          skip(): void {
            const isFirstHydration = concludeHydration(HydrationConcludeType.skip)
            if (isFirstHydration) {
              core.M$hydrate(core.M$get())
            }
          },
        })
      }
    })
  }

  const hydrateIfLifecycleInitIsProvided = (): void => {
    if (isFunction(lifecycle.init)) {
      hydrate(lifecycle.init)
    }
  }

  // This runs the first round of hydration for this source as soon as it is
  // deemed that it no longer has parent deps that are still hydrating.
  hydrateIfLifecycleInitIsProvided()

  // Watchers are used to allow subsequent hydrations if any parent deps are
  // being rehydrated.
  const depWatchers: Array<() => void> = []
  for (const dep of deps) {
    // Register child depenency to this source
    dep[INTERNALS_SYMBOL].M$childDeps[normalizedKey] = true
    const unwatchDepHydration = dep.watch((event) => {
      // Ignore if event is not caused by hydration
      if (event.type !== RelinkEventType.hydrate) { return }
      if (event.isHydrating === true) {
        // Dependency is entering init status
        gatedFlow.M$lock()
        // Subsequent hydrations are queued here. Every time dependency
        // enters init status, it should be init-ed again after that/
        // Hence, `lifecycle.init` is added to the queue immediately ——
        // before other methods can be added to the queue.
        hydrateIfLifecycleInitIsProvided()
        // Gate is closed before calling `gateExecHydration` so that hydration
        // is queued deferred until deps have finished hydrating.
      } else {
        if (allDepsAreReady(deps)) {
          gatedFlow.M$open()
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
      let nextState: S
      if (isFunction(stateOrReducer)) {
        const executedReducer = stateOrReducer(core.M$get())
        /**
         * This allows the execution to be synchronous if the reducer is also
         * synchronous. Consider the code below:
         * ```js
         * nextState = isThenable(executedReducer)
         *   ? await executedReducer
         *   : executedReducer
         * ```
         * This would make the execution asynchronous regardless of whether or
         * not reducer is asynchronous.
         * `.M$exec(async (): Promise<void> => { ...`
         * And for unclear reasons, this creates a delay in integration tests
         * that would result in inaccurate assertions.
         * At the same time, if, by conditionally making the execution
         * asynchronous eliminates unnecessary delay, this also means we get a
         * little bit of performance gain.
         */
        if (isThenable(executedReducer)) {
          return new Promise((resolve) => {
            executedReducer.then((fulfilledPartialState) => {
              nextState = fulfilledPartialState // Is an asynchronous reducer
              resolve()
            })
          })
        } else {
          nextState = executedReducer // Is a reducer
        }
      } else {
        nextState = stateOrReducer // Is a state
      }
      core.M$dynamicSet(nextState)
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
  const UNSTABLE_cleanup = (): void => {
    const childDepStack = Object.keys(M$childDeps)
    if (childDepStack.length !== 0) {
      devWarn(
        `Attempted to call \`${UNSTABLE_cleanup.name}()\` on ` +
        `'${String(normalizedKey)}' while there are still other sources ` +
        `that depend on it: '${childDepStack.join('\', \'')}'.`
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
    UNSTABLE_cleanup,
  }

}
