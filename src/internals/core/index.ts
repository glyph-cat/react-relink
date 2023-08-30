import { RelinkEvent, RelinkEventType } from '../../abstractions'
import { Watcher } from '../../internals/watcher'
import { THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER } from '../errors'

/**
 * @internal
 */
export enum EndHydrationMarker {
  /** `commit`        */ C = 1,
  /** `commitDefault` */ D,
  /** `commitNoop`    */ N,
}

// Because TypeScript throws error when declaring overrides but implementing it
// using arrow functions...Zzz
interface MethodImplementatinoEndHydration<State> {
  (marker: EndHydrationMarker.C, incomingState: State): void
  (
    marker: EndHydrationMarker.D | EndHydrationMarker.N,
    incomingState?: never
  ): void
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

  M$set = (incomingState: State): void => {
    this.M$bumpMutationCount(this.M$currentState, incomingState)
    this.M$currentState = incomingState
    this.M$watcher.M$refresh({
      type: RelinkEventType.set,
      state: this.M$currentState,
    })
  }

  M$reset = (): void => {
    this.M$bumpMutationCount(this.M$currentState, this.M$defaultState)
    this.M$currentState = this.M$defaultState
    this.M$watcher.M$refresh({
      type: RelinkEventType.reset,
      state: this.M$currentState,
    })
  }

  M$beginHydration = (): void => {
    if (!this.M$isHydrating) {
      this.M$isHydrating = true
      this.M$watcher.M$refresh({
        isHydrating: this.M$isHydrating,
        type: RelinkEventType.hydrate,
        state: this.M$currentState,
      })
    }
  }

  M$endHydration: MethodImplementatinoEndHydration<State> = (
    marker: EndHydrationMarker,
    incomingState?: State
  ): void => {
    if (this.M$isHydrating) {
      if (marker === EndHydrationMarker.C) {
        // Otherwise, assume that it is just an ordinary `commit`.
        this.M$bumpMutationCount(this.M$currentState, incomingState)
        this.M$currentState = incomingState
      } else if (marker === EndHydrationMarker.N) {
        // Nothing needs to be done here.
      } else if (marker === EndHydrationMarker.D) {
        // Use the initial state.
        this.M$bumpMutationCount(this.M$currentState, this.M$defaultState)
        this.M$currentState = this.M$defaultState
      } else {
        // It should be theoretically impossible to reach here.
        throw THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER(marker)
      }
      this.M$isHydrating = false
      this.M$watcher.M$refresh({
        isHydrating: this.M$isHydrating,
        type: RelinkEventType.hydrate,
        state: this.M$currentState,
      })
    }
  }

}
