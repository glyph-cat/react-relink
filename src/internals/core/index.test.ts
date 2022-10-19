import { RelinkEvent, RelinkEventType } from '../../schema'
import { RelinkCore } from '.'

// NOTE: This test covers the following aspects:
// * Testing for mutability - so that we don't have to worry about it anywhere
//   else anymore.
// * Ensuring that events are fired accordingly.

describe(RelinkCore.name, (): void => {

  test('M$get', (): void => {
    const defaultState = { value: 1 }
    const core = new RelinkCore(defaultState)
    expect(core.M$currentState).toStrictEqual({ value: 1 })
    expect(Object.is(core.M$currentState, defaultState)).toBe(true)
  })

  describe('M$dynamicSet', (): void => {

    describe('set', (): void => {

      const defaultState = { value: 1 }
      const core = new RelinkCore(defaultState)
      const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
      const unwatchStateChange = core.M$watcher.M$watch((event): void => {
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

    describe('reset', (): void => {

      const defaultState = { value: 1 }
      const core = new RelinkCore(defaultState)
      const capturedEventStack: Array<RelinkEvent<typeof defaultState>> = []
      const unwatchStateChange = core.M$watcher.M$watch((event): void => {
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

    test('Mutation count', () => {
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

  })

  describe('M$hydrate', (): void => {

    // TODO

    // interface TestState { value: number }

    // test('Commit strategy', (): void => {

    //   const core = new RelinkCore({ value: 1 })
    //   const capturedEventStack: Array<RelinkEvent<TestState>> = []
    //   const unwatchStateChange = core.M$watcher.M$watch((event): void => {
    //     capturedEventStack.push(event)
    //   })

    //   core.M$hydrate(/* Empty means hydration is starting */)
    //   expect(core.M$currentState).toStrictEqual({ value: 1 })
    //   expect(core.M$isHydrating).toBe(true)
    //   expect(capturedEventStack).toStrictEqual([{
    //     type: RelinkEventType.hydrate,
    //     isHydrating: true,
    //     state: { value: 1 },
    //   }])

    //   core.M$hydrate({ value: 2 })
    //   expect(core.M$currentState).toStrictEqual({ value: 2 })
    //   expect(core.M$isHydrating).toBe(false)
    //   expect(capturedEventStack).toStrictEqual([{
    //     type: RelinkEventType.hydrate,
    //     isHydrating: true,
    //     state: { value: 1 },
    //   }, {
    //     type: RelinkEventType.hydrate,
    //     isHydrating: false,
    //     state: { value: 2 },
    //   }])

    //   // Cleanup
    //   unwatchStateChange()

    // })

    // test('Skip strategy', (): void => {

    //   const core = new RelinkCore({ value: 1 })
    //   const capturedEventStack: Array<RelinkEvent<TestState>> = []
    //   const unwatchStateChange = core.M$watcher.M$watch((event): void => {
    //     capturedEventStack.push(event)
    //   })

    //   core.M$hydrate(/* Empty means hydration is starting */)
    //   expect(core.M$currentState).toStrictEqual({ value: 1 })
    //   expect(core.M$isHydrating).toBe(true)
    //   expect(capturedEventStack).toStrictEqual([{
    //     type: RelinkEventType.hydrate,
    //     isHydrating: true,
    //     state: { value: 1 },
    //   }])

    //   core.M$hydrate(HYDRATION_SKIP_MARKER)
    //   expect(core.M$currentState).toStrictEqual({ value: 1 })
    //   expect(core.M$isHydrating).toBe(false)
    //   expect(capturedEventStack).toStrictEqual([{
    //     type: RelinkEventType.hydrate,
    //     isHydrating: true,
    //     state: { value: 1 },
    //   }, {
    //     type: RelinkEventType.hydrate,
    //     isHydrating: false,
    //     state: { value: 1 },
    //   }])

    //   // Cleanup
    //   unwatchStateChange()

    // })

    // test('Mutation count', () => {

    //   const defaultState = { value: 1 }
    //   const hydratedState = { value: 2 }
    //   const core = new RelinkCore(defaultState)
    //   expect(core.M$mutationCount).toBe(0)

    //   core.M$hydrate(HYDRATION_SKIP_MARKER)
    //   expect(core.M$mutationCount).toBe(0)
    //   core.M$hydrate(HYDRATION_SKIP_MARKER)
    //   expect(core.M$mutationCount).toBe(0)

    //   core.M$hydrate(hydratedState)
    //   expect(core.M$mutationCount).toBe(1)
    //   core.M$hydrate(hydratedState)
    //   expect(core.M$mutationCount).toBe(1)

    //   core.M$hydrate(HYDRATION_SKIP_MARKER)
    //   expect(core.M$mutationCount).toBe(2)
    //   core.M$hydrate(HYDRATION_SKIP_MARKER)
    //   expect(core.M$mutationCount).toBe(2)

    // })

    // describe('Special cases', (): void => {

    //   describe('Omit firing events for repeated hydration change', (): void => {

    //     test('Hydration start', (): void => {

    //       const core = new RelinkCore({ value: 1 })
    //       const capturedEventStack: Array<RelinkEvent<TestState>> = []
    //       const unwatchStateChange = core.M$watcher.M$watch((event): void => {
    //         capturedEventStack.push(event)
    //       })

    //       // If already hydrating, calling 'M$hydrate' will not cause anymore
    //       // events to be fired.
    //       core.M$hydrate(/* Empty means hydration is starting */)
    //       core.M$hydrate(/* Empty means hydration is starting */)
    //       expect(capturedEventStack).toStrictEqual([{
    //         type: RelinkEventType.hydrate,
    //         isHydrating: true,
    //         state: { value: 1 },
    //       }])

    //       // Cleanup
    //       unwatchStateChange()

    //     })

    //     test('Hydration end', (): void => {

    //       const core = new RelinkCore({ value: 1 })
    //       const capturedEventStack: Array<RelinkEvent<TestState>> = []
    //       const unwatchStateChange = core.M$watcher.M$watch((event): void => {
    //         capturedEventStack.push(event)
    //       })

    //       // If already not hydrating, calling 'M$hydrate' N times will result
    //       // in N events being fired.
    //       core.M$hydrate({ value: 2 })
    //       core.M$hydrate({ value: 3 })
    //       expect(capturedEventStack).toStrictEqual([{
    //         type: RelinkEventType.hydrate,
    //         isHydrating: false,
    //         state: { value: 2 },
    //       }, {
    //         type: RelinkEventType.hydrate,
    //         isHydrating: false,
    //         state: { value: 3 },
    //       }])

    //       // Cleanup
    //       unwatchStateChange()

    //     })

    //   })

    // })

  })

})
