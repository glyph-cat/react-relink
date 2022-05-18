import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { useReducer } from 'react'
import { forceUpdateReducer } from '../force-update'
import { useRef } from '.'


describe(useRef.name, (): void => {

  const cleanupRef = createCleanupRef()
  afterEach((): void => { cleanupRef.run() })

  test('Direct value', (): void => {

    function useCompoundHook() {
      const ref = useRef()
      const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
      return { ref, forceUpdate }
    }

    const hookInterface = createHookInterface({
      useHook: useCompoundHook,
      actions: {
        assignValueToRef: ({ hookData }): void => {
          const { ref } = hookData
          ref.current = 42
        },
        forceUpdate: ({ hookData }): void => {
          const { forceUpdate } = hookData
          forceUpdate()
        },
      },
      values: {
        value: ({ hookData }) => {
          return hookData.ref
        },
      },
    }, cleanupRef)

    // Initial stage
    expect(hookInterface.get('value')).toStrictEqual({ current: null })
    expect(hookInterface.getRenderCount()).toBe(1)

    // Assign value to ref
    hookInterface.actions('assignValueToRef')
    expect(hookInterface.get('value')).toStrictEqual({ current: 42 })
    expect(hookInterface.getRenderCount()).toBe(1)

    // Check if value of ref persists across different render phases
    hookInterface.actions('forceUpdate')
    expect(hookInterface.get('value')).toStrictEqual({ current: 42 })
    expect(hookInterface.getRenderCount()).toBe(2)

  })

  test('Factory', (): void => {

    function useCompoundHook() {
      const ref = useRef(() => 10)
      const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
      return { ref, forceUpdate }
    }

    const hookInterface = createHookInterface({
      useHook: useCompoundHook,
      actions: {
        assignValueToRef: ({ hookData }): void => {
          const { ref } = hookData
          ref.current = 42
        },
        forceUpdate: ({ hookData }): void => {
          const { forceUpdate } = hookData
          forceUpdate()
        },
      },
      values: {
        value: ({ hookData }) => {
          return hookData.ref
        },
      },
    }, cleanupRef)

    // Initial stage
    expect(hookInterface.get('value')).toStrictEqual({ current: 10 })
    expect(hookInterface.getRenderCount()).toBe(1)

    // Assign value to ref
    hookInterface.actions('assignValueToRef')
    expect(hookInterface.get('value')).toStrictEqual({ current: 42 })
    expect(hookInterface.getRenderCount()).toBe(1)

    // Check if value of ref persists across different render phases
    hookInterface.actions('forceUpdate')
    expect(hookInterface.get('value')).toStrictEqual({ current: 42 })
    expect(hookInterface.getRenderCount()).toBe(2)

  })

})
