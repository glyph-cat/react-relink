import deepCopy from '../deep-copy'
import { RelinkEvent, RelinkEventType, RelinkSourceKey } from '../../schema'
import {
  createWatcher,
  UnwatchCallback,
  WatcherCallback,
} from '../../private/watcher'
import { createDebugLogger } from '../debug-logger'
import { ObjectMarker } from '../helper-types'

const OMISSION_MARKER: ObjectMarker = {} as const
export const HYDRATION_SKIP_MARKER: ObjectMarker = {} as const

function isIncomingStateOmitted(
  incomingState: unknown
): incomingState is typeof OMISSION_MARKER {
  return Object.is(incomingState, OMISSION_MARKER)
}

interface RelinkCore<S> {
  /**
   * Get the direct reference of the current state.
   */
  M$directGet(): S
  /**
   * Retrieve the current state. Will be deep copied if mutability is disabled.
   */
  M$get(): S
  /**
   * Perform 'set' or 'reset' actions.
   */
  M$dynamicSet(incomingState?: S | typeof OMISSION_MARKER): void
  /**
   * 'Start' or 'End' a hydration.
   */
  M$hydrate(incomingState?: S | typeof OMISSION_MARKER): void
  /**
   * Retrieve current status on whether core is currently hydrating.
   */
  M$getIsHydrating(): boolean
  /**
   * The same `M$watch` method from `createWatcher`.
   */
  M$watch(callback: WatcherCallback<[RelinkEvent<S>]>): UnwatchCallback
  /**
   * The same `M$unwatchAll` method from `createWatcher`.
   */
  M$unwatchAll(): void
}

/**
 * A barebones state management setup meant to be used internally only.
 */
export function createRelinkCore<S>(
  defaultState: S,
  isSourceMutable: boolean,
  sourceKey?: RelinkSourceKey
): RelinkCore<S> {

  const debugLogger = createDebugLogger(sourceKey)
  // debugLogger.echo('Core created')

  const copyState = (s: S): S => isSourceMutable ? s : deepCopy(s)
  const initialState: S = copyState(defaultState) // 📦 (<<<) Receive
  let currentState: S = copyState(initialState) // 📦 (<<<) Receive
  let isHydrating = false
  const watcher = createWatcher<[RelinkEvent<S>]>()

  const M$directGet = (): S => currentState

  const M$get = (): S => copyState(currentState) // 📦 (>>>) Expose

  const M$getIsHydrating = (): boolean => isHydrating

  const M$hydrate = (
    // Refer to Local Note [A] near end of file
    incomingState: S | typeof OMISSION_MARKER = OMISSION_MARKER
  ): void => {
    const isHydrationStart = isIncomingStateOmitted(incomingState)
    const hydrationStateDidChange = isHydrating !== isHydrationStart
    isHydrating = isHydrationStart

    if (isHydrationStart) {
      debugLogger.echo('Starting hydration')
    } else {
      debugLogger.echo('Concluding hydration')
    }

    if (!isHydrationStart) {
      if (Object.is(incomingState, HYDRATION_SKIP_MARKER)) {
        // Assume using the initial state
        currentState = initialState // 📦 (~~~) Internal transfer
        // Refer to Local Note [C] near end of file
      } else {
        currentState = copyState(incomingState) // 📦 (<<<) Receive
      }
    }

    // NOTES:
    // * An event will be fired if hydration ended.
    // * An event will also be fired if hydration started, but only if it hasn't
    // already started, if that makes sense.
    if (!isHydrating || isHydrating && hydrationStateDidChange) {
      debugLogger.echo(`🔥 Firing hydration event (isHydrating: ${isHydrating})`)
      watcher.M$refresh({
        isHydrating,
        type: RelinkEventType.hydrate,
        state: M$get(), // Refer to Local Note [B] near end of file
      })
    }
  }

  const M$dynamicSet = (
    // Refer to Local Note [A] near end of file
    incomingState: S | typeof OMISSION_MARKER = OMISSION_MARKER
  ): void => {
    const isReset = isIncomingStateOmitted(incomingState)
    if (isReset) {
      // Refer to Local Note [C] near end of file
      currentState = initialState // 📦 (~~~) Internal transfer
    } else {
      currentState = copyState(incomingState) // 📦 (<<<) Receive
    }
    watcher.M$refresh({
      type: isReset ? RelinkEventType.reset : RelinkEventType.set,
      state: M$get(), // Refer to Local Note [B] near end of file
    })
  }

  return {
    M$directGet,
    M$get,
    M$hydrate,
    M$dynamicSet,
    M$getIsHydrating,
    M$watch: watcher.M$watch,
    M$unwatchAll: watcher.M$unwatchAll,
  }

}

// === Local Notes ===
// [A] If incoming state is not provided, it defaults to the omission marker in
//     `M$dynamicSet` and `M$hydrate`. This way, we won't mix up with falsey
//     values because the object reference is clearly different.
// [B] By using the getter `M$get()` whenever we need to access the current
//     state, this guarantees a consistent behaviour every-fucking-where in
//     terms of mutability —— and this preserves sanity.
// [C] We do not need `copyState` here because is has already been called at
//     the declaration of `initialState` as a constant variable. If source is
//     mutable and user somehow changed the default state, it is only the
//     natural behaviour that when reset is called, the current state  will
//     'revert' to the tampered `initialState`.
