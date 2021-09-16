import { useState } from '.'
import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

describe(useState.name, () => {

  test('Primitive data', () => {
    const hookInterface = createHookInterface({
      useHook: () => useState(() => (1), true),
      actions: {
        overrideValue: ({ hookData }) => {
          const [, setState] = hookData
          setState(2)
        },
      },
      values: {
        value: ({ hookData }) => {
          const [state] = hookData
          return state
        },
      },
    }, cleanupRef)

    // Initial stage
    expect(hookInterface.get('value')).toBe(1)
    expect(hookInterface.getRenderCount()).toBe(1)

    // Trigger update
    hookInterface.actions('overrideValue')
    expect(hookInterface.get('value')).toBe(2)
    expect(hookInterface.getRenderCount()).toBe(2)

  })

  // TODO
  // test('Object', () => {
  //   const hookInterface = createHookInterface({
  //     useHook: () => useState(() => ({ foo: 1, bar: 2 }), true),
  //     actions: {
  //       overrideValue: ({ hookData }) => {
  //         const [, setState] = hookData
  //         setState(2)
  //       },
  //     },
  //     values: {
  //       value: ({ hookData }) => {
  //         const [state] = hookData
  //         return state
  //       },
  //     },
  //   }, cleanupRef)
  // })

})
