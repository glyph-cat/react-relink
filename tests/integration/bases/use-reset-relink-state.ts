import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { delay, IntegrationTestProps, TIME_GAP } from '../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {

  const {
    createSource,
    useSetRelinkState,
    useResetRelinkState,
    useRelinkValue,
  } = Relink

  const TEST_METHOD_NAME = 'useResetRelinkState'
  describe(TEST_METHOD_NAME, (): void => {

    test('Normal + No unnecessary re-rendering', async (): Promise<void> => {

      const Source = createSource({
        key: `test/${TEST_METHOD_NAME}`,
        default: 1,
      })

      const hookInterfaceA1 = createHookInterface({
        useHook: () => useSetRelinkState(Source),
        actions: {
          step: ({ hookData: setState }): void => {
            setState(2)
          },
        },
      }, cleanupRef)

      const hookInterfaceA2 = createHookInterface({
        useHook: () => useResetRelinkState(Source),
        actions: {
          reset: ({ hookData: resetState }): void => {
            resetState()
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

      // Update phase
      hookInterfaceA1.actions('step')
      expect(hookInterfaceB.get('value')).toBe(2)

      // Reset phase
      hookInterfaceA2.actions('reset')
      await delay(TIME_GAP(1)) // KIV: Not sure why this needs await
      expect(hookInterfaceB.get('value')).toBe(1)

      // Check if A & B, which only uses the setter & resetter, performs any
      // extra re-rendering.
      expect(hookInterfaceA1.getRenderCount()).toBe(1)
      expect(hookInterfaceA2.getRenderCount()).toBe(1)

      // Cleanup
      Source.UNSTABLE_cleanup()

    })
  })

}
