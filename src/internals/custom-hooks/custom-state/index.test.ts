import { useCustomState } from '.'
import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'

// Test sets: Primitive vs Object

describe(useCustomState.name, (): void => {

  const cleanupRef = createCleanupRef()
  afterEach((): void => { cleanupRef.run() })

  test('Primitive data', (): void => {

    const hookInterface = createHookInterface({
      useHook: () => useCustomState(() => 1, Object.is),
      actions: {
        goodPracticeSet: ({ hookData }): void => {
          const [, setState] = hookData
          setState(2)
        },
        badPracticeSet: ({ hookData }): void => {
          let [state] = hookData
          const [, setState] = hookData
          setState(++state)
        },
      },
      values: {
        value: ({ hookData }): number => {
          const [state] = hookData
          return state
        },
      },
    }, cleanupRef)

    // Initial stage
    expect(hookInterface.get('value')).toBe(1)
    expect(hookInterface.getRenderCount()).toBe(1)

    // Trigger update with good practice
    hookInterface.actions('goodPracticeSet')
    expect(hookInterface.get('value')).toBe(2)
    expect(hookInterface.getRenderCount()).toBe(2)

    // Trigger update with bad practice
    hookInterface.actions('badPracticeSet')
    expect(hookInterface.get('value')).toBe(3)
    expect(hookInterface.getRenderCount()).toBe(3)
    // Primitive data is passed by value, the original remains unchanged.
    // Component SHOULD re-render.

  })

  describe('Object', (): void => {

    interface DemoStateSchema { foo: number, bar: number }

    const hookInterface = createHookInterface({
      useHook: () => useCustomState<DemoStateSchema>(() => ({
        foo: 1,
        bar: 2,
      }), Object.is),
      actions: {
        setWithDifferentRef: ({ hookData }): void => {
          const [, setState] = hookData
          setState({ foo: 1, bar: 2 })
        },
        goodPracticeSet: ({ hookData }): void => {
          const [, setState] = hookData
          setState({ foo: 1, bar: 3 })
        },
        badPracticeSet: ({ hookData }): void => {
          const [state, setState] = hookData
          state.bar += 1
          setState(state)
        },
      },
      values: {
        value: ({ hookData }): DemoStateSchema => {
          const [state] = hookData
          return state
        },
      },
    }, cleanupRef)

    // Initial stage
    expect(hookInterface.get('value')).toStrictEqual({ foo: 1, bar: 2 })
    expect(hookInterface.getRenderCount()).toBe(1)

    // Trigger update with same value but different reference
    hookInterface.actions('setWithDifferentRef')
    expect(hookInterface.get('value')).toStrictEqual({ foo: 1, bar: 2 })
    expect(hookInterface.getRenderCount()).toBe(2)
    // Reference compare sees both objects as DIFFERENT objects.
    // Component SHOULD NOT re-render.

    // Trigger update with good practice
    hookInterface.actions('goodPracticeSet')
    expect(hookInterface.get('value')).toStrictEqual({ foo: 1, bar: 3 })
    expect(hookInterface.getRenderCount()).toBe(3)

    // Trigger update with bad practice
    hookInterface.actions('badPracticeSet')
    expect(hookInterface.get('value')).toStrictEqual({ foo: 1, bar: 4 })
    expect(hookInterface.getRenderCount()).toBe(3)
    // Object children are passed by reference, the original has been changed.
    // Component SHOULD NOT re-render.

  })

})
