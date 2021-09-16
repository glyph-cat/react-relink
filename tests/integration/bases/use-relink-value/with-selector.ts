import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkValue, useSetRelinkState } = Relink
  const TEST_METHOD_NAME = 'useRelinkValue'
  test('With selector + No unnecessary re-rendering', (): void => {

    const Source = createSource({
      key: `test/${TEST_METHOD_NAME}-s`,
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
        step: ({ hookData: setState }): void => {
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
