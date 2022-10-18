import { RelinkEvent, RelinkEventType } from '../../schema'
import { Watcher } from '../../internals/watcher'
import { ObjectMarker } from '../helper-types'

/**
 * @internal
 */
export enum HydrationMarker {
  OMIT = 1,
  SKIP,
  NOOP,
  DEFAULT,
}

/**
 * @internal
 */
const OMISSION_MARKER: ObjectMarker = {} as const

/**
 * @internal
 */
export const HYDRATION_SKIP_MARKER: ObjectMarker = {} as const

/**
 * @internal
 */
export const HYDRATION_COMMIT_NOOP_MARKER: ObjectMarker = {} as const

/**
 * @internal
 */
export const HYDRATION_COMMIT_DEFAULT_MARKER: ObjectMarker = {} as const

/**
 * @internal
 */
function isIncomingStateOmitted(
  incomingState: unknown
): incomingState is typeof OMISSION_MARKER {
  return Object.is(incomingState, OMISSION_MARKER)
}

/**
 * A barebones state management setup meant to be used internally only.
 * @internal
 */
export class RelinkCore<State> {

  private M$defaultState: State
  M$currentState: State
  M$mutationCount = 0
  M$isHydrating = false
  M$watcher = new Watcher<[RelinkEvent<State>]>()

  constructor(defaultState: State) {
    this.M$defaultState = defaultState
    this.M$currentState = defaultState
  }

  private M$bumpMutationCount(prevState: State, nextState: State): void {
    if (!Object.is(prevState, nextState)) {
      this.M$mutationCount += 1
    }
  }

  /**
   * Perform 'set' or 'reset' actions.
   */
  M$dynamicSet(
    // incomingState?: S | typeof OMISSION_MARKER
    // Refer to Local Note [A] near end of file
    incomingState: State | typeof OMISSION_MARKER = OMISSION_MARKER
  ): void {
    const isReset = isIncomingStateOmitted(incomingState)
    if (isReset) {
      this.M$bumpMutationCount(this.M$currentState, this.M$defaultState)
      this.M$currentState = this.M$defaultState
    } else {
      this.M$bumpMutationCount(this.M$currentState, incomingState)
      this.M$currentState = incomingState
    }
    this.M$watcher.M$refresh({
      type: isReset ? RelinkEventType.reset : RelinkEventType.set,
      state: this.M$currentState,
    })
  }

  /**
   * 'Start' or 'End' a hydration.
   */
  M$hydrate(
    // Refer to Local Note [A] near end of file
    incomingState: State | typeof OMISSION_MARKER = OMISSION_MARKER
  ): void {
    const isHydrationStart = isIncomingStateOmitted(incomingState)
    const hydrationStateDidChange = this.M$isHydrating !== isHydrationStart
    this.M$isHydrating = isHydrationStart

    if (!isHydrationStart) {
      if (Object.is(incomingState, HYDRATION_SKIP_MARKER)) {
        this.M$bumpMutationCount(this.M$currentState, this.M$defaultState)
        this.M$currentState = this.M$defaultState
        // ^ Assume using the initial state
      } else if (Object.is(incomingState, HYDRATION_COMMIT_DEFAULT_MARKER)) {
        this.M$bumpMutationCount(this.M$currentState, this.M$defaultState)
        this.M$currentState = this.M$defaultState
      } else if (Object.is(incomingState, HYDRATION_COMMIT_NOOP_MARKER)) {
        // Do nothing here
      } else {
        this.M$bumpMutationCount(this.M$currentState, incomingState)
        this.M$currentState = incomingState
      }
    }

    // NOTES:
    // * An event will be fired if hydration ended.
    // * An event will also be fired if hydration started, but only if it hasn't
    // already started, if that makes sense.
    if (!this.M$isHydrating || this.M$isHydrating && hydrationStateDidChange) {
      this.M$watcher.M$refresh({
        isHydrating: this.M$isHydrating,
        type: RelinkEventType.hydrate,
        state: this.M$currentState,
      })
    }
  }

}

// === Local Notes ===
// [A] If incoming state is not provided, it defaults to the omission marker in
//     `M$dynamicSet` and `M$hydrate`. This way, we won't mix up with falsey
//     values because the object reference is clearly different.
