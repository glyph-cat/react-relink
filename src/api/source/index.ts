import { IS_DEV_ENV } from '../../constants'
import { allDepsAreReady } from '../../internals/all-deps-are-ready'
import {
  RelinkCore,
  HYDRATION_SKIP_MARKER,
  HYDRATION_COMMIT_DEFAULT_MARKER,
  HYDRATION_COMMIT_NOOP_MARKER,
} from '../../internals/core'
import { checkForCircularDeps } from '../../internals/circular-deps'
import { devError, devWarn } from '../../internals/dev'
import {
  getErrorMessageOnFailToRemoveSelfKeyFromParentDep,
  getWarningForForwardedHydrationCallbackValue,
  getWarningForSourceDisposalWithActiveDeps,
  TYPE_ERROR_SOURCE_KEY,
} from '../../internals/errors'
import { GatedFlow } from '../../internals/gated-flow'
import { registerKey, unregisterKey } from '../../internals/key-registry'
import {
  createNoUselessHydrationWarner,
  HydrationConcludeType,
} from '../../internals/no-useless-hydration-warner'
import { startMeasuringReducerPerformance } from '../../internals/performance'
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

/**
 * @internal
 */
const DEFAULT_OPTIONS: RelinkSourceOptions = {
  public: false,
  suspense: false,
} as const

export interface DisposeOptions {
  /**
   * When `true`, the source will be disposed even if there are pending calls to
   * methods such as `.set(...)`, `.reset()`, `.getAsync()` and `.hydrate(...)`.
   *
   * ## *WARNING: This is a niche feature that is almost never used except for when handling sources with cyclic dependencies in a test environment.*
   * @defaultValue `false`
   */
  force?: boolean
}

/**
 * @public
 */
export interface RelinkSourceConfig<State> {
  /**
   * A unique key for the source. Use a string or number for better clarity in a
   * normal project, use a
   * [`Symbol`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
   * instead if you're building a library to avoid clashing with user-defined keys.
   */
  key: RelinkSourceKey
  /**
   *
   */
  scope?: RelinkSource<State>
  /**
   * The default state of the source.
   */
  default: State
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
  lifecycle?: RelinkLifecycleConfig<State>
  /**
   * Additional options to configure the source.
   */
  options?: RelinkSourceOptions
}

/**
 * @public
 */
export class RelinkSource<State> {

  /**
   * @internal
   */
  readonly M$key: RelinkSourceKey

  /**
   * @internal
   */
  readonly M$defaultState: State

  /**
   * @internal
   */
  readonly M$scopeId: number

  /**
   * @internal
   */
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly M$parentDeps: Array<RelinkSource<any>>

  /**
   * @internal
   */
  readonly M$gatedFlow: GatedFlow

  /**
   * @internal
   */
  readonly M$options: RelinkSourceOptions

  /**
   * @internal
   */
  readonly M$core: RelinkCore<State>

  /**
   * Since `.watch()` methods returns an `unwatch` callback, we need a place to
   * store them. Then, when disposing the source, we can iterate this array to
   * unwatch all of them.
   * @internal
   */
  readonly M$depWatchers: Array<() => void> = []

  /**
   * An array containing keys of child sources.
   * @internal
   */
  readonly M$childDeps: Array<RelinkSourceKey> = []

  /**
   * @see {@link RelinkSourceConfig.key}
   */
  get key(): RelinkSourceKey { return this.M$key }

  /**
   * @see {@link RelinkSourceConfig.default}
   */
  get default(): State { return this.M$defaultState }

  constructor({
    key: rawKey,
    scope,
    deps = [],
    default: defaultState,
    lifecycle = {},
    options: rawOptions,
  }: RelinkSourceConfig<State>) {

    // === Key checking ===
    const typeofRawKey = typeof rawKey
    if (
      typeofRawKey === 'string' ||
      typeofRawKey === 'number' ||
      typeofRawKey === 'symbol'
    ) {
      this.M$key = rawKey
      if (rawKey === '') {
        devWarn('Did you just pass an empty string as a source key? Be careful, it can lead to problems that are hard to diagnose and debug later on.')
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
    this.watch = this.watch.bind(this)
    this.cleanup = this.cleanup.bind(this)
    this.dispose = this.dispose.bind(this)

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
    this.M$defaultState = defaultState

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
      dep.M$childDeps.push(this.M$key)
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
   * to re-render, but {@link RelinkEventType.set} events will not be fired and
   * `lifecycle.didSet` will not be called so that the same data doesn't get
   * persisted back to the `localStorage` or server.
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
  hydrate(callback: RelinkHydrateCallback<State>): Promise<void> {
    // NOTE: `core.M$hydrate` was previously not wrapped in 'M$exec'. Firing
    // multiple `.hydrate()` calls will most likely cause bugs because of this.
    this.M$gatedFlow.M$exec((): void => {
      this.M$core.M$hydrate(/* Empty means hydration is starting */)
    })
    return this.M$gatedFlow.M$exec((): void | Promise<void> => {
      const concludeHydration = createNoUselessHydrationWarner(this.M$key)

      const executedCallback = callback({
        commit: (hydratedState: State): void => {
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
        commitDefault: (): void => {
          const isFirstHydration = concludeHydration(HydrationConcludeType.M$skip)
          if (isFirstHydration) {
            this.M$core.M$hydrate(HYDRATION_COMMIT_DEFAULT_MARKER)
          }
        },
        commitNoop: (): void => {
          const isFirstHydration = concludeHydration(HydrationConcludeType.M$skip)
          if (isFirstHydration) {
            this.M$core.M$hydrate(HYDRATION_COMMIT_NOOP_MARKER)
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
  get(): State {
    return this.M$core.M$currentState
  }

  /**
   * Get the latest state. The state will only be returned after pending state
   * changes have completed. Any further state changes will only be triggered
   * after this promise is resolved.
   * @example
   * await Source.getAsync()
   */
  getAsync(): Promise<State> {
    return this.M$gatedFlow.M$exec((): State => {
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
  set(nextState: State): Promise<void>

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
  set(reducer: (currentState: State) => State | Promise<State>): Promise<void>

  set(stateOrReducer: State | ((currentState: State) => State | Promise<State>)): Promise<void> {
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
  watch(callback: ((event: RelinkEvent<State>) => void)): (() => void) {
    return this.M$core.M$watcher.M$watch(callback)
  }

  /**
   * ## 🚨 DEPRECATED 🚨
   * Please refer to the `@deprecated` tag for more information.
   *
   * ---------------------------------------------------------------------------
   *
   * Dispose the source when it is no longer in use to reduce memory consumption.
   *
   * Use cases where this method is useful:
   * - When dynamically created sources are no longer needed;
   * - Inside the teardown function of a test.
   *
   * @example
   * function MyComponent() {
   *   const Source = useRef(null)
   *   if (!Source.current) { Source = new RelinkSource(...) }
   *   useEffect(() => {
   *     return () => { Source.current.cleanup() }
   *   }, [])
   *   return '...'
   * }
   * @deprecated Please use {@link dispose} instead. This method will be removed
   * in the next major version.
   */
  cleanup(): void {
    // Check if there are any child dependants and proceed to cleanup anyway,
    // but show a warning if there are child dependants so that developers will
    // be aware that there might be unintended behaviours.
    if (IS_DEV_ENV) {
      if (this.M$childDeps.length !== 0) {
        devWarn(getWarningForSourceDisposalWithActiveDeps(this.M$key, this.M$childDeps))
      }
    }

    // Unregister current source as child dependency from all parent sources
    for (const parentDep of this.M$parentDeps) {
      if (!parentDep.M$childDeps) { continue }
      // ^ Parent dep has probably been disposed of already.
      const indexOfSelfKeyInParentSource = parentDep.M$childDeps.findIndex((value) => {
        return Object.is(value, this.M$key)
      })
      if (indexOfSelfKeyInParentSource >= 0) {
        parentDep.M$childDeps.splice(indexOfSelfKeyInParentSource, 1)
      } else {
        if (IS_DEV_ENV) {
          devError(getErrorMessageOnFailToRemoveSelfKeyFromParentDep(this.M$key, parentDep.M$key))
        }
      }
    }

    this.M$core.M$watcher.M$unwatchAll()
    unregisterKey(this.M$key)

    // Stop receiving events from parent sources
    while (this.M$depWatchers.length > 0) {
      this.M$depWatchers.shift()() // Immediately invokes `unwatch()`
    }
  }

  /**
   * ## 🚧 EXPERIMENTAL 🚧
   * This is an experimental feature. Until it is stable, the usage, parameters,
   * and behaviours might change from version to version, potentially causing
   * your app to break when you update the package between minor and even patch
   * versions!
   *
   * ---------------------------------------------------------------------------
   *
   * Dispose the source when it is no longer in use to reduce memory consumption.
   *
   * Use cases where this method is useful:
   * - When dynamically created sources are no longer needed;
   * - Inside the teardown function of a test.
   *
   * There are some differences between this method and {@link cleanup}.
   * After invoking this method:
   * - the source will no longer emit events or trigger comopnent re-renders
   * upon state change; and
   * - all properties and methods of the source will no longer be accessible.
   *
   * @example
   * function MyComponent() {
   *   const Source = useRef(null)
   *   if (!Source.current) { Source = new RelinkSource(...) }
   *   useEffect(() => {
   *     return () => { Source.current.dispose() }
   *   }, [])
   *   return '...'
   * }
   */
  async dispose(options: DisposeOptions = {}): Promise<void> {
    if (!options.force) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await this.M$gatedFlow.M$exec(() => { })
      // ^ Nothing needs to be done here, but it allows us to wait for all
      //   queued executions to complete before cleaning up.
    }
    this.cleanup()
    for (const propertyOrMethod in this) {
      delete this[propertyOrMethod]
    }
    // KIV
    // Binded methods seem to remain intact without explicitly changing setting
    // their values to undefined. The other class properties that are used by
    // these methods, however, have already become undefined.
    this.get = undefined
    this.getAsync = undefined
    this.set = undefined
    this.reset = undefined
    this.hydrate = undefined
    this.cleanup = undefined
    this.dispose = undefined
    this.watch = undefined
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
//     And for unclear reasons, this creates a delay in the tests that
//     would result in inaccurate assertions. At the same time, if, by
//     conditionally making the execution asynchronous eliminates unnecessary
//     delay, this also means we get a little bit of performance gain.
