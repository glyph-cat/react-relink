import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, useSetRelinkState, useRelinkValue } = Relink

  test('Normal + No unnecessary re-rendering', () => {

    const Source = createSource({
      key: `test/${useSetRelinkState.name}/normal`,
      default: 1,
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useSetRelinkState(Source),
      actions: {
        step: ({ hookData: setState }) => {
          setState((c) => c + 1)
        },
        replace: ({ hookData: setState }) => {
          setState(5)
        },
      },
    }, cleanupRef)

    const hookInterfaceB = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterfaceB.get('value')).toBe(1)

    // Update phase - callback
    hookInterfaceA.actions('step')
    expect(hookInterfaceB.get('value')).toBe(2)

    // Update phase - replace value
    hookInterfaceA.actions('replace')
    expect(hookInterfaceB.get('value')).toBe(5)

    // Check if A, which only uses the setter, performs extra re-renders
    expect(hookInterfaceA.getRenderCount()).toBe(1)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })

}
