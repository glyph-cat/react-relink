import { IS_DEV_ENV } from '../../constants'
import { allDepsAreReady } from '../../internals/all-deps-are-ready'
import { RelinkCore, HYDRATION_SKIP_MARKER } from '../../internals/core'
import { checkForCircularDeps } from '../../internals/circular-deps'
import { devWarn } from '../../internals/dev'
import {
  getWarningForForwardedHydrationCallbackValue,
  TYPE_ERROR_SOURCE_KEY,
} from '../../internals/errors'
import { GatedFlow } from '../../internals/gated-flow'
import { registerKey, unregisterKey } from '../../internals/key-registry'
import {
  createNoUselessHydrationWarner,
  HydrationConcludeType,
} from '../../internals/no-useless-hydration-warner'
import { startMeasuringReducerPerformance } from '../../internals/performance'
import { safeStringJoin } from '../../internals/string-formatting'
import { isFunction, isThenable } from '../../internals/type-checker'
import {
  RelinkEventType,
  RelinkLifecycleConfig,
  RelinkSourceKey,
  RelinkSourceOptions,
  RelinkHydrateCallback,
  RelinkEvent,
} from '../../schema'
import { getNewScopeId } from '../scope'

// NOTE:
// Factory pattern is used throughout the codebase because class method names
// are not mangled by Terser, this causes problems in production build where
// variable name mangling takes place.

/**
 * @internal
 */
const DEFAULT_OPTIONS: RelinkSourceOptions = {
  public: false,
  suspense: false,
  virtualBatch: false,
} as const

/**
 * @deprecated Please use the `instanceof` keyword instead.
 * Example: `yourVariable instanceof RelinkSource`
 * @public
 */
export function isRelinkSource<S = unknown>(
  value: unknown
): value is RelinkSource<S> {
  return value instanceof RelinkSource
}

/**
 * @public
 */
export interface RelinkSourceConfig<S> {
  /**
   * A unique key for the source. Use a string or number for better clarity in a
   * normal project, use a Symbol instead if you're building a library to avoid
   * clashing with user-defined keys.
   */
  key: RelinkSourceKey
  /**
   *
   */
  scope?: RelinkSource<S>
  /**
   * The default state of the source.
   */
  default: S
  /**
   * Wait for other sources to be hydrated before this one does.
   */
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: Array<RelinkSource<any>>
  /**
   * A hooks to this source to run certain callbacks when certain events are
   * fired.
   */
  lifecycle?: RelinkLifecycleConfig<S>
  /**
   * Additional options to configure the source.
   */
  options?: RelinkSourceOptions
}

/**
 * @public
 * @deprecated Kept for compatibility purposes. Will be removed in next major
 * version. Please use `new RelinkSource(...)` instead.
 */
export function createSource<S>(config: RelinkSourceConfig<S>): RelinkSource<S> {
  return new RelinkSource(config)
}

/**
 * @public
 */
export class RelinkSource<S> {

  /**
   * @internal
   */
  M$key: RelinkSourceKey

  /**
   * @internal
   */
  M$scopeId: number

  /**
   * @internal
   */
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M$parentDeps: Array<RelinkSource<any>>

  /**
   * @internal
   */
  M$gatedFlow: GatedFlow

  /**
   * @internal
   */
  M$options: RelinkSourceOptions

  /**
   * @internal
   */
  M$core: RelinkCore<S>

  /**
   * @internal
   */
  M$depWatchers: Array<() => void> = []

  /**
   * @internal
   */
  M$childDeps: Record<RelinkSourceKey, true> = {}

  constructor({
    key: rawKey,
    scope,
    deps = [],
    default: defaultState,
    lifecycle = {},
    options: rawOptions,
  }: RelinkSourceConfig<S>) {

    // === Key checking ===
    const typeofRawKey = typeof rawKey
    if (typeofRawKey === 'string' ||
      typeofRawKey === 'number' ||
      typeofRawKey === 'symbol'
    ) {
      this.M$key = rawKey
      if (rawKey === '') {
        devWarn('Did you just passed an empty string as a source key? Be careful, it can lead to problems that are hard to diagnose and debug later on.')
      }
    } else {
      throw TYPE_ERROR_SOURCE_KEY(typeofRawKey)
    }

    // === Bind methods ===
    // Refer to Special Note 'D' in 'src/README.md'
    this.hydrate = this.hydrate.bind(this)
    this.get = this.get.bind(this)
    this.getAsync = this.getAsync.bind(this)
    this.set = this.set.bind(this)
    this.reset = this.reset.bind(this)
    this.cleanup = this.cleanup.bind(this)

    registerKey(this.M$key)
    // const debugLogger = createDebugLogger(normalizedKey)
    checkForCircularDeps(deps, [this.M$key])
    this.M$parentDeps = deps
    this.M$scopeId = scope ? scope.M$scopeId : getNewScopeId()

    /**
     * Gate being opened DOES NOT MEAN the source has been hydrated and is ready
     * to use, but rather, it means that the source can finally hydrate itself.
     * Also, gate is opened right away if there are no dependencies.
     */
    this.M$gatedFlow = new GatedFlow(deps.length <= 0, this.M$key)

    this.M$options = { ...DEFAULT_OPTIONS, ...rawOptions }
    this.M$core = new RelinkCore(defaultState)

    const attemptHydration = async (): Promise<void> => {
      if (isFunction(lifecycle.init)) {
        await this.hydrate(lifecycle.init)
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

    for (const dep of deps) {
      // Register child depenency to this source
      dep.M$childDeps[this.M$key] = true
      const unwatchDepHydration = dep.watch((event) => {
        // Ignore if event is not caused by hydration
        if (event.type !== RelinkEventType.hydrate) { return }
        if (event.isHydrating) {
          // Lock gate to prevent further state changes.
          // gatedFlow.M$lock()
          // Let it be known that this source is (pending) hydrating
          this.M$core.M$hydrate(/* Empty means hydration is starting */)
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
            attemptHydration()
          }
        }
      })
      this.M$depWatchers.push(unwatchDepHydration)
    }


    // === Lifecycle ===
    // NOTE: When cleaning up, `M$unwatchAll` is called, so we don't need to worry
    // about unwatching here.
    if (isFunction(lifecycle.didSet)) {
      this.M$core.M$watcher.M$watch((event): void => {
        if (event.type === RelinkEventType.set) {
          lifecycle.didSet(event)
        }
      })
    }
    if (isFunction(lifecycle.didReset)) {
      this.M$core.M$watcher.M$watch((event): void => {
        if (event.type === RelinkEventType.reset) {
          lifecycle.didReset(event)
        }
      })
    }

  }

  /**
   * Self is not hydrating && deps are not hydrating.
   * @internal
   */
  M$getIsReadyStatus = (): boolean => {
    // NOTE: If this source's `lifecycle.init` is not provided, `isHydrating`
    // should always be false.
    const isHydrating = this.M$core.M$isHydrating
    const areAllDepsReallyReady = allDepsAreReady(this.M$parentDeps)
    const isReady = !isHydrating && areAllDepsReallyReady
    return isReady
  }

  /**
   * Rehydrates the source. Useful when you need to fetch data from
   * `localStorage` or a server. This will change the state and cause components
   * to re-render, but won't fire event `lifecycle.didSet` so that the same data
   * doesn't get persisted back to the `localStorage` or server.
   * @example
   * Source.hydrate(({ commit, skip }) => {
   * const rawValue = localStorage.getItem(storageKey)
   *   let parsedValue
   *   try {
   *     parsedValue = JSON.parse(rawValue)
   *   } catch (e) {
   *     console.error(e)
   *   } finally {
   *     if (parsedValue) {
   *       // Conclude the hydration with the persisted data.
   *       commit(parsedValue)
   *     } else {
   *       // Conclude the hydration with the default state.
   *       skip()
   *     }
   *   }
   * })
   */
  hydrate(callback: RelinkHydrateCallback<S>): Promise<void> {
    // NOTE: `core.M$hydrate` was previously not wrapped in 'M$exec'. Firing
    // multiple `.hydrate()` calls will most likely cause bugs because of this.
    this.M$gatedFlow.M$exec((): void => {
      this.M$core.M$hydrate(/* Empty means hydration is starting */)
    })
    return this.M$gatedFlow.M$exec((): void | Promise<void> => {
      const concludeHydration = createNoUselessHydrationWarner(this.M$key)

      const executedCallback = callback({
        commit: (hydratedState: S): void => {
          const isFirstHydration = concludeHydration(HydrationConcludeType.M$commit)
          if (isFirstHydration) {
            this.M$core.M$hydrate(hydratedState)
          }
        },
        skip: (): void => {
          const isFirstHydration = concludeHydration(HydrationConcludeType.M$skip)
          if (isFirstHydration) {
            this.M$core.M$hydrate(HYDRATION_SKIP_MARKER)
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
          // Await is not used here, otherwise it affects the flow of execution
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

  /**
   * Get the current state. This is regardless of whether there are any pending
   * state changes.
   * @example
   * Source.get()
   */
  get(): S {
    return this.M$core.M$currentState
  }

  /**
   * Get the latest state. The state will only be returned after pending state
   * changes have completed. Any further state changes will only be triggered
   * after this promise is resolved.
   * @example
   * await Source.getAsync()
   */
  getAsync(): Promise<S> {
    return this.M$gatedFlow.M$exec((): S => {
      return this.M$core.M$currentState
    })
  }

  /**
   * Change the value of the state. Note that state values are not always
   * updated immediately, if the next line of code depends on the latest state
   * value, then you should use `await` on this method.
   * @example // Directly set new value (Immediate state change not guaranteed)
   * Source.set(newValue)
   * @example // Directly set new value (State change on next line guaranteed)
   * await Source.set(newValue)
   */
  set(nextState: S): Promise<void>

  /**
   * Change the value of the state. Note that state values are not always
   * updated immediately, if the next line of code depends on the latest state
   * value, then you should use `await` on this method.
   * @example // With reducer (Immediate state change not guaranteed)
   * Source.set((oldValue) => ({ ...oldValue, ...newValue }))
   * @example // With async reducer (Immediate state change not guaranteed)
   * Source.set(async (oldValue) => ({ ...oldValue, ...newValue }))
   * @example // With reducer (State change on next line guaranteed)
   * await Source.set((oldValue) => ({ ...oldValue, ...newValue }))
   * @example // With async reducer (State change on next line guaranteed)
   * await Source.set(async (oldValue) => ({ ...oldValue, ...newValue }))
   */
  set(reducer: (currentState: S) => S | Promise<S>): Promise<void>

  set(stateOrReducer: S | ((currentState: S) => S | Promise<S>)): Promise<void> {
    return this.M$gatedFlow.M$exec((): void | Promise<void> => {
      // let nextState: S
      if (isFunction(stateOrReducer)) {
        const perfMeasurer = startMeasuringReducerPerformance(this.M$key)
        const executedReducer = stateOrReducer(this.M$core.M$currentState)
        // Refer to Local Note [A] near end of file
        if (isThenable(executedReducer)) {
          perfMeasurer.isAsync.current = true
          return new Promise((resolve, reject) => {
            executedReducer.then((fulfilledPartialState) => {
              this.M$core.M$dynamicSet(fulfilledPartialState) // Is async reducer
              resolve()
            }).catch((e) => {
              reject(e)
            }).finally(() => {
              perfMeasurer.stop()
            })
          })
        } else {
          this.M$core.M$dynamicSet(executedReducer) // Is reducer
          perfMeasurer.stop()
        }
      } else {
        this.M$core.M$dynamicSet(stateOrReducer) // Is direct set
      }
    })
  }

  /**
   * @example
   * Source.reset() // Immediate state change not guaranteed
   * @example
   * await Source.reset() // State change on next line guaranteed
   */
  reset(): Promise<void> {
    return this.M$gatedFlow.M$exec((): void => {
      this.M$core.M$dynamicSet(/* Empty means reset */)
    })
  }

  /**
   * @example
   * useLayoutEffect(() => {
   *   const unwatch = Source.watch((event) => {
   *     // ...
   *   })
   *   return () => { unwatch() }
   * }, [Source])
   */
  watch(callback: ((event: RelinkEvent<S>) => void)): (() => void) {
    return this.M$core.M$watcher.M$watch(callback)
  }

  // KIV:
  // We still haven't been able to find a way to check if sources are still in
  // use so that we can automatically clean them up, but since for most cases,
  // sources are used for as long as an app is opened, this can be temporarily
  // disregarded.

  /**
   * ## 🚧 EXPERIMENTAL 🚧
   * This method might behave differently or get renamed between minor and patch
   * versions, or even get removed in future versions.
   *
   * ---------------------------------------------------------------------------
   *
   * If sources are dynamically created, it is best to call this
   * cleanup function when they are no longer needed.
   * @example
   * function MyComponent() {
   *   const Source = useRef(null)
   *   if (!Source.current) { Source = new RelinkSource(...) }
   *   useEffect(() => {
   *     return () => { Source.current.cleanup() }
   *   }, [])
   *   return '...'
   * }
   */
  cleanup(): void {
    // Check if there are any child dependants and proceed to cleanup anyway,
    // but show a warning if there are child dependants so that developers will
    // be aware that there might be unintended behaviours.
    if (IS_DEV_ENV) {
      const childDepStack = Object.keys(this.M$childDeps)
      if (childDepStack.length !== 0) {
        devWarn(
          `Attempted to cleanup '${String(this.M$key)}' while there are ` +
          'still other sources that depend on it: ' +
          `'${safeStringJoin(childDepStack, '\', \'')}'.`
        )
      }
    }
    for (const dep of this.M$parentDeps) {
      // Unregister child depenency from this source
      delete dep.M$childDeps[this.M$key]
    }
    this.M$core.M$watcher.M$unwatchAll()
    unregisterKey(this.M$key)
    while (this.M$depWatchers.length > 0) {
      this.M$depWatchers.shift()() // Immediately invokes `unwatch()`
    }
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
