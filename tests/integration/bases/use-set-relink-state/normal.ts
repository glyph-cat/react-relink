import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { delay, IntegrationTestProps, TIME_GAP } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, useSetRelinkState, useRelinkValue } = Relink

  const TEST_METHOD_NAME = 'useSetRelinkState'
  test('Normal + No unnecessary re-rendering', async (): Promise<void> => {

    const Source = createSource({
      key: `test/${TEST_METHOD_NAME}/normal`,
      default: 1,
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useSetRelinkState(Source),
      actions: {
        step: ({ hookData: setState }): void => {
          setState((c) => c + 1)
        },
        replace: ({ hookData: setState }): void => {
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
    await delay(TIME_GAP(1)) // KIV: Not sure why this needs await
    expect(hookInterfaceB.get('value')).toBe(5)

    // Check if A, which only uses the setter, performs extra re-renders
    expect(hookInterfaceA.getRenderCount()).toBe(1)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })

}
