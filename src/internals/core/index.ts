import { RelinkEvent, RelinkEventType } from '../../schema'
import { Watcher } from '../../internals/watcher'
import { ObjectMarker } from '../helper-types'

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
function isIncomingStateOmitted(
  incomingState: unknown
): incomingState is typeof OMISSION_MARKER {
  return Object.is(incomingState, OMISSION_MARKER)
}

/**
 * A barebones state management setup meant to be used internally only.
 * @internal
 */
export class RelinkCore<S> {

  private M$defaultState: S
  M$currentState: S
  M$isHydrating = false
  M$watcher = new Watcher<[RelinkEvent<S>]>()

  constructor(defaultState: S) {
    this.M$defaultState = defaultState
    this.M$currentState = defaultState
  }

  /**
   * Perform 'set' or 'reset' actions.
   */
  M$dynamicSet(
    // incomingState?: S | typeof OMISSION_MARKER
    // Refer to Local Note [A] near end of file
    incomingState: S | typeof OMISSION_MARKER = OMISSION_MARKER
  ): void {
    const isReset = isIncomingStateOmitted(incomingState)
    if (isReset) {
      // Refer to Local Note [C] near end of file
      this.M$currentState = this.M$defaultState
    } else {
      this.M$currentState = incomingState
    }
    this.M$watcher.M$refresh({
      type: isReset ? RelinkEventType.reset : RelinkEventType.set,
      state: this.M$currentState, // Refer to Local Note [B] near end of file
    })
  }

  /**
   * 'Start' or 'End' a hydration.
   */
  M$hydrate(
    // Refer to Local Note [A] near end of file
    incomingState: S | typeof OMISSION_MARKER = OMISSION_MARKER
  ): void {
    const isHydrationStart = isIncomingStateOmitted(incomingState)
    const hydrationStateDidChange = this.M$isHydrating !== isHydrationStart
    this.M$isHydrating = isHydrationStart

    if (!isHydrationStart) {
      if (Object.is(incomingState, HYDRATION_SKIP_MARKER)) {
        // Assume using the initial state
        this.M$currentState = this.M$defaultState
        // Refer to Local Note [C] near end of file
      } else {
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

// /**
//  * A barebones state management setup meant to be used internally only.
//  */
// function createRelinkCore<S>(defaultState: S): RelinkCore<S> {

//   let currentState: S = defaultState
//   let isHydrating = false
//   const M$watcher = new Watcher<[RelinkEvent<S>]>()

//   const M$get = (): S => currentState

//   const M$getIsHydrating = (): boolean => isHydrating

//   const M$hydrate = (
//     // Refer to Local Note [A] near end of file
//     incomingState: S | typeof OMISSION_MARKER = OMISSION_MARKER
//   ): void => {
//     // const isHydrationStart = isIncomingStateOmitted(incomingState)
//     // const hydrationStateDidChange = isHydrating !== isHydrationStart
//     // isHydrating = isHydrationStart

//     // if (!isHydrationStart) {
//     //   if (Object.is(incomingState, HYDRATION_SKIP_MARKER)) {
//     //     // Assume using the initial state
//     //     currentState = defaultState
//     //     // Refer to Local Note [C] near end of file
//     //   } else {
//     //     currentState = incomingState
//     //   }
//     // }

//     // // NOTES:
//     // // * An event will be fired if hydration ended.
//     // // * An event will also be fired if hydration started, but only if it hasn't
//     // // already started, if that makes sense.
//     // if (!isHydrating || isHydrating && hydrationStateDidChange) {
//     //   M$watcher.M$refresh({
//     //     isHydrating,
//     //     type: RelinkEventType.hydrate,
//     //     state: M$get(), // Refer to Local Note [B] near end of file
//     //   })
//     // }
//   }

//   const M$dynamicSet = (
//     // Refer to Local Note [A] near end of file
//     incomingState: S | typeof OMISSION_MARKER = OMISSION_MARKER
//   ): void => {
//     const isReset = isIncomingStateOmitted(incomingState)
//     if (isReset) {
//       // Refer to Local Note [C] near end of file
//       currentState = defaultState
//     } else {
//       currentState = incomingState
//     }
//     M$watcher.M$refresh({
//       type: isReset ? RelinkEventType.reset : RelinkEventType.set,
//       state: M$get(), // Refer to Local Note [B] near end of file
//     })
//   }

//   return {
//     M$get,
//     M$hydrate,
//     M$dynamicSet,
//     M$getIsHydrating,
//     M$watcher,
//     // M$watch: M$watcher.M$watch,
//     // M$unwatchAll: M$watcher.M$unwatchAll,
//   }

// }





// === Local Notes ===
// [A] If incoming state is not provided, it defaults to the omission marker in
//     `M$dynamicSet` and `M$hydrate`. This way, we won't mix up with falsey
//     values because the object reference is clearly different.
// [B] By using the getter `M$get()` whenever we need to access the current
//     state, this guarantees a consistent behaviour every-fucking-where in
//     terms of mutability —— and this preserves sanity.
// [C] (No longer relevant, kept as archive)
//     We do not need `copyState` here because is has already been called at
//     the declaration of `initialState` as a constant variable. If source is
//     mutable and user somehow changed the default state, it is only the
//     natural behaviour that when reset is called, the current state  will
//     'revert' to the tampered `initialState`.
