import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkValue, useSetRelinkState } = Relink
  test('With selector + No unnecessary re-rendering', () => {

    const Source = createSource({
      key: `test/${useRelinkValue.name}-s`,
      default: { foo: 1, bar: 2 },
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    const hookInterfaceB = createHookInterface({
      useHook: () => useRelinkValue(Source, ({ bar }) => bar),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    const hookInterfaceC = createHookInterface({
      useHook: () => useSetRelinkState(Source),
      actions: {
        step: ({ hookData: setState }) => {
          setState((oldState) => ({ ...oldState, foo: oldState.foo + 1 }))
        },
      },
    }, cleanupRef)

    // Check initial value
    expect(hookInterfaceA.get('value')).toStrictEqual({ foo: 1, bar: 2 })
    expect(hookInterfaceB.get('value')).toBe(2)

    // Modify state
    hookInterfaceC.actions('step')

    // Check value again
    expect(hookInterfaceA.get('value')).toStrictEqual({ foo: 2, bar: 2 })
    expect(hookInterfaceB.get('value')).toBe(2)

    // Check render count
    expect(hookInterfaceA.getRenderCount()).toBe(2)
    expect(hookInterfaceB.getRenderCount()).toBe(1)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
