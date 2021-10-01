import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps, TIME_GAP } from '../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  test('With Virtual Batch', (): void => {
    jest.useFakeTimers()
    const Source = createSource({
      key: 'test/virtual-batch',
      default: 1,
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      actions: {
        step: ({ hookData }): void => {
          const [, setCounter] = hookData
          setCounter(c => c + 1)
        },
      },
      values: {
        value: ({ hookData }): number => {
          const [counter] = hookData
          return counter
        },
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterface.getRenderCount()).toBe(1)

    // Update (Invoke 'step' multiple times in the same `act()` callback)
    hookInterface.actions('step', 'step', 'step', 'step')
    jest.advanceTimersByTime(TIME_GAP(1))
    expect(hookInterface.get('value')).toBe(5)

    // Check for unnecessary renders
    expect(hookInterface.getRenderCount()).toBe(2)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
