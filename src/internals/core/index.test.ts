import { EndHydrationMarker, RelinkCore } from '.'
import { RelinkEvent, RelinkEventType } from '../../abstractions'

// NOTE: This test covers the following aspects:
// * Testing for mutability - so that we don't have to worry about it anywhere
//   else anymore.
// * Ensuring that events are fired accordingly.

describe(RelinkCore.name, () => {

  // NOTE: There is not "M$get" method, we read directly from `M$currentState`.
  test('"M$get"', () => {
    const defaultState = { value: 1 }
    const core = new RelinkCore(defaultState)
    expect(core.M$currentState).toStrictEqual({ value: 1 })
    expect(Object.is(core.M$currentState, defaultState)).toBe(true)
  })

  test('M$set', () => {

    const defaultState = { value: 1 }
    const core = new RelinkCore(defaultState)
    const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
    const unwatchStateChange = core.M$watcher.M$watch((event) => {
      capturedEventStack.push(event)
    })

    // Trigger a state change
    const newState = { value: 2 }
    core.M$set(newState)
    expect(core.M$currentState).toStrictEqual({ value: 2 })
    expect(Object.is(core.M$currentState, newState)).toBe(true)
    expect(capturedEventStack).toStrictEqual([{
      type: RelinkEventType.set,
      state: { value: 2 },
    }])
    expect(Object.is(
      capturedEventStack[0].state,
      newState
    )).toBe(true)

    // Cleanup
    unwatchStateChange()

  })

  test('M$reset', () => {

    const defaultState = { value: 1 }
    const core = new RelinkCore(defaultState)
    const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
    const unwatchStateChange = core.M$watcher.M$watch((event) => {
      capturedEventStack.push(event)
    })

    // Trigger a state change followed by a state reset
    core.M$set({ value: 2 })
    core.M$reset()
    expect(core.M$currentState).toStrictEqual({ value: 1 })
    expect(Object.is(core.M$currentState, defaultState)).toBe(true)
    expect(capturedEventStack).toStrictEqual([{
      type: RelinkEventType.set,
      state: { value: 2 },
    }, {
      type: RelinkEventType.reset,
      state: { value: 1 },
    }])
    expect(Object.is(
      capturedEventStack[1].state,
      defaultState
    )).toBe(true)

    // Cleanup
    unwatchStateChange()

  })

  test('M$set and M$reset mutation count', () => {
    const defaultState = { value: 1 }
    const nextState = { value: 2 }
    const core = new RelinkCore(defaultState)
    expect(core.M$mutationCount).toBe(0)

    core.M$set(nextState)
    expect(core.M$mutationCount).toBe(1)
    core.M$set(nextState)
    expect(core.M$mutationCount).toBe(1)

    core.M$reset()
    expect(core.M$mutationCount).toBe(2)
    core.M$reset()
    expect(core.M$mutationCount).toBe(2)
  })

  describe('M$beginHydration & M$endHydration', () => {

    interface TestState { value: number }

    test('Strategy: Commit', () => {

      const core = new RelinkCore({ value: 1 })
      const capturedEventStack: Array<RelinkEvent<TestState>> = []
      const unwatchStateChange = core.M$watcher.M$watch((event) => {
        capturedEventStack.push(event)
      })

      core.M$beginHydration()
      expect(core.M$currentState).toStrictEqual({ value: 1 })
      expect(core.M$isHydrating).toBe(true)
      expect(capturedEventStack).toStrictEqual([{
        type: RelinkEventType.hydrate,
        isHydrating: true,
        state: { value: 1 },
      }])

      core.M$endHydration(EndHydrationMarker.C, { value: 2 })
      expect(core.M$currentState).toStrictEqual({ value: 2 })
      expect(core.M$isHydrating).toBe(false)
      expect(capturedEventStack).toStrictEqual([{
        type: RelinkEventType.hydrate,
        isHydrating: true,
        state: { value: 1 },
      }, {
        type: RelinkEventType.hydrate,
        isHydrating: false,
        state: { value: 2 },
      }])

      // Cleanup
      unwatchStateChange()

    })

    describe('Mutation count', () => {

      const defaultState = { value: 1 }
      const hydratedState = { value: 2 }

      test('Strategy: Commit', () => {
        const core = new RelinkCore(defaultState)
        core.M$beginHydration()
        core.M$endHydration(EndHydrationMarker.C, hydratedState)
        core.M$beginHydration()
        core.M$endHydration(EndHydrationMarker.C, hydratedState)
        expect(core.M$mutationCount).toBe(1)
      })

      test('Strategy: Commit No-op', () => {
        const core = new RelinkCore(defaultState)
        core.M$beginHydration()
        core.M$endHydration(EndHydrationMarker.N)
        core.M$beginHydration()
        core.M$endHydration(EndHydrationMarker.N)
        expect(core.M$mutationCount).toBe(0)
      })

      describe('Strategy: Commit Default', () => {

        test('When state is already default)', () => {
          const core = new RelinkCore(defaultState)
          core.M$beginHydration()
          core.M$endHydration(EndHydrationMarker.D)
          core.M$beginHydration()
          core.M$endHydration(EndHydrationMarker.D)
          expect(core.M$mutationCount).toBe(0)
        })

        test('When state is not default)', () => {
          const core = new RelinkCore(defaultState)
          core.M$set({ value: 5 })
          core.M$beginHydration()
          core.M$endHydration(EndHydrationMarker.D)
          core.M$beginHydration()
          core.M$endHydration(EndHydrationMarker.D)
          expect(core.M$mutationCount).toBe(2)
        })

      })

    })

    describe('Special cases', () => {

      describe('Omit firing events for repeated hydration change', () => {

        test('Hydration start', () => {

          const core = new RelinkCore({ value: 1 })
          const capturedEventStack: Array<RelinkEvent<TestState>> = []
          const unwatchStateChange = core.M$watcher.M$watch((event) => {
            capturedEventStack.push(event)
          })

          // If already hydrating, calling `M$beginHydration` will not cause
          // anymore events to be fired.
          core.M$beginHydration()
          // ^ We have to call `M$beginHydration` once because
          // `this.M$isHydrating` is false by default.
          core.M$beginHydration()
          expect(capturedEventStack).toStrictEqual([{
            type: RelinkEventType.hydrate,
            isHydrating: true,
            state: { value: 1 },
          }])

          // Cleanup
          unwatchStateChange()

        })

        test('Hydration end', () => {

          const core = new RelinkCore({ value: 1 })
          const capturedEventStack: Array<RelinkEvent<TestState>> = []
          const unwatchStateChange = core.M$watcher.M$watch((event) => {
            capturedEventStack.push(event)
          })

          // If already not hydrating, calling `M$endHydration will be ignored.
          core.M$endHydration(EndHydrationMarker.C, { value: 2 })
          core.M$endHydration(EndHydrationMarker.C, { value: 3 })
          expect(capturedEventStack).toStrictEqual([])

          // Cleanup
          unwatchStateChange()

        })

      })

    })

  })

})
