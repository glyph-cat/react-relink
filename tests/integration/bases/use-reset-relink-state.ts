import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../constants'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {

  const {
    createSource,
    useSetRelinkState,
    useResetRelinkState,
    useRelinkValue,
  } = Relink

  describe(useResetRelinkState.name, () => {

    test('Normal + No unnecessary re-rendering', () => {

      const Source = createSource({
        key: `test/${useResetRelinkState.name}`,
        default: 1,
      })

      const hookInterfaceA1 = createHookInterface({
        useHook: () => useSetRelinkState(Source),
        actions: {
          step: ({ hookData: setState }) => {
            setState(2)
          },
        },
      }, cleanupRef)

      const hookInterfaceA2 = createHookInterface({
        useHook: () => useResetRelinkState(Source),
        actions: {
          reset: ({ hookData: resetState }) => {
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
