import { RelinkEvent, RelinkEventType } from '../../schema'
import { createRelinkCore, HYDRATION_SKIP_MARKER } from '.'

// NOTE: This test covers the following aspects:
// * Testing for mutability - so that we don't have to worry about it anywhere
//   else anymore.
// * Ensuring that events are fired accordingly.

describe(createRelinkCore.name, (): void => {

  describe('M$directGet', (): void => {

    test('isSourceMutable: true', (): void => {
      const defaultState = { value: 1 }
      const core = createRelinkCore(defaultState, true)
      expect(core.M$directGet()).toStrictEqual({ value: 1 })
      expect(Object.is(core.M$directGet(), defaultState)).toBe(true)
    })

    test('isSourceMutable: false', (): void => {
      const defaultState = { value: 1 }
      const core = createRelinkCore(defaultState, false)
      expect(core.M$directGet()).toStrictEqual({ value: 1 })
      expect(Object.is(core.M$directGet(), defaultState)).toBe(false)
      // ^ Because `initialState` is deed-copied from `defaultState`
    })

  })

  describe('M$get', (): void => {

    test('isSourceMutable: true', (): void => {
      const defaultState = { value: 1 }
      const core = createRelinkCore(defaultState, true)
      expect(core.M$get()).toStrictEqual({ value: 1 })
      expect(Object.is(core.M$get(), defaultState)).toBe(true)
    })

    test('isSourceMutable: false', (): void => {
      const defaultState = { value: 1 }
      const core = createRelinkCore(defaultState, false)
      expect(core.M$get()).toStrictEqual({ value: 1 })
      expect(Object.is(core.M$get(), defaultState)).toBe(false)
    })

  })

  describe('M$dynamicSet', (): void => {

    describe('set', (): void => {

      test('isSourceMutable: true', (): void => {

        const defaultState = { value: 1 }
        const core = createRelinkCore(defaultState, true)
        const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
        const unwatchStateChange = core.M$watch((event): void => {
          capturedEventStack.push(event)
        })

        // Trigger a state change
        const newState = { value: 2 }
        core.M$dynamicSet(newState)
        expect(core.M$get()).toStrictEqual({ value: 2 })
        expect(Object.is(core.M$get(), newState)).toBe(true)
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

      test('isSourceMutable: false', (): void => {

        const defaultState = { value: 1 }
        const core = createRelinkCore(defaultState, false)
        const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
        const unwatchStateChange = core.M$watch((event): void => {
          capturedEventStack.push(event)
        })

        // Trigger a state change
        const newState = { value: 2 }
        core.M$dynamicSet(newState)
        expect(core.M$get()).toStrictEqual({ value: 2 })
        expect(Object.is(core.M$get(), newState)).toBe(false)
        expect(capturedEventStack).toStrictEqual([{
          type: RelinkEventType.set,
          state: { value: 2 },
        }])
        expect(Object.is(
          capturedEventStack[0].state,
          newState
        )).toBe(false)

        // Cleanup
        unwatchStateChange()

      })

    })

    describe('reset', (): void => {

      test('isSourceMutable: true', (): void => {

        const defaultState = { value: 1 }
        const core = createRelinkCore(defaultState, true)
        const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
        const unwatchStateChange = core.M$watch((event): void => {
          capturedEventStack.push(event)
        })

        // Trigger a state change followed by a state reset
        core.M$dynamicSet({ value: 2 })
        core.M$dynamicSet(/* Empty means reset */)
        expect(core.M$get()).toStrictEqual({ value: 1 })
        expect(Object.is(core.M$get(), defaultState)).toBe(true)
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

      test('isSourceMutable: false', (): void => {

        const defaultState = { value: 1 }
        const core = createRelinkCore(defaultState, false)
        const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
        const unwatchStateChange = core.M$watch((event): void => {
          capturedEventStack.push(event)
        })

        // Trigger a state change followed by a state reset
        core.M$dynamicSet({ value: 2 })
        core.M$dynamicSet(/* Empty means reset */)
        expect(core.M$get()).toStrictEqual({ value: 1 })
        expect(Object.is(core.M$get(), defaultState)).toBe(false)
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
        )).toBe(false)
        // ^ Because `initialState` is deed-copied from `defaultState`

        // Cleanup
        unwatchStateChange()

      })

    })

  })

  describe('M$hydrate', (): void => {

    interface TestState { value: number }

    test('Commit strategy', (): void => {

      const core = createRelinkCore({ value: 1 }, false)
      const capturedEventStack: Array<RelinkEvent<TestState>> = []
      const unwatchStateChange = core.M$watch((event): void => {
        capturedEventStack.push(event)
      })

      core.M$hydrate(/* Empty means hydration is starting */)
      expect(core.M$get()).toStrictEqual({ value: 1 })
      expect(core.M$getHydrationStatus()).toBe(true)
      expect(capturedEventStack).toStrictEqual([{
        type: RelinkEventType.hydrate,
        isHydrating: true,
        state: { value: 1 },
      }])

      core.M$hydrate({ value: 2 })
      expect(core.M$get()).toStrictEqual({ value: 2 })
      expect(core.M$getHydrationStatus()).toBe(false)
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

    test('Skip strategy', (): void => {

      const core = createRelinkCore({ value: 1 }, false)
      const capturedEventStack: Array<RelinkEvent<TestState>> = []
      const unwatchStateChange = core.M$watch((event): void => {
        capturedEventStack.push(event)
      })

      core.M$hydrate(/* Empty means hydration is starting */)
      expect(core.M$get()).toStrictEqual({ value: 1 })
      expect(core.M$getHydrationStatus()).toBe(true)
      expect(capturedEventStack).toStrictEqual([{
        type: RelinkEventType.hydrate,
        isHydrating: true,
        state: { value: 1 },
      }])

      core.M$hydrate(HYDRATION_SKIP_MARKER)
      expect(core.M$get()).toStrictEqual({ value: 1 })
      expect(core.M$getHydrationStatus()).toBe(false)
      expect(capturedEventStack).toStrictEqual([{
        type: RelinkEventType.hydrate,
        isHydrating: true,
        state: { value: 1 },
      }, {
        type: RelinkEventType.hydrate,
        isHydrating: false,
        state: { value: 1 },
      }])

      // Cleanup
      unwatchStateChange()

    })

    describe('Special cases', (): void => {

      describe('Omit firing events for repeated hydration change', (): void => {

        test('Hydration start', (): void => {

          const core = createRelinkCore({ value: 1 }, false)
          const capturedEventStack: Array<RelinkEvent<TestState>> = []
          const unwatchStateChange = core.M$watch((event): void => {
            capturedEventStack.push(event)
          })

          // If already hydrating, calling 'M$hydrate' will not cause anymore
          // events to be fired.
          core.M$hydrate(/* Empty means hydration is starting */)
          core.M$hydrate(/* Empty means hydration is starting */)
          expect(capturedEventStack).toStrictEqual([{
            type: RelinkEventType.hydrate,
            isHydrating: true,
            state: { value: 1 },
          }])

          // Cleanup
          unwatchStateChange()

        })

        test('Hydration end', (): void => {

          const core = createRelinkCore({ value: 1 }, false)
          const capturedEventStack: Array<RelinkEvent<TestState>> = []
          const unwatchStateChange = core.M$watch((event): void => {
            capturedEventStack.push(event)
          })

          // If already not hydrating, calling 'M$hydrate' N times will result
          // in N events being fired.
          core.M$hydrate({ value: 2 })
          core.M$hydrate({ value: 3 })
          expect(capturedEventStack).toStrictEqual([{
            type: RelinkEventType.hydrate,
            isHydrating: false,
            state: { value: 2 },
          }, {
            type: RelinkEventType.hydrate,
            isHydrating: false,
            state: { value: 3 },
          }])

          // Cleanup
          unwatchStateChange()

        })

      })

    })

  })

})
