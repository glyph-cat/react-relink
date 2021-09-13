import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../constants'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  test('With Virtual Batch', () => {
    jest.useFakeTimers()
    const Source = createSource({
      key: 'test/virtual-batch',
      default: 1,
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      actions: {
        step: ({ hookData }) => {
          const [, setCounter] = hookData
          setCounter((c) => c + 1)
        },
      },
      values: {
        value: ({ hookData }) => {
          const [counter] = hookData
          return counter
        },
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterface.getRenderCount()).toBe(1)

    // Update (Invoke 'step' twice in the same `act()` callback)
    hookInterface.actions('step', 'step')
    jest.advanceTimersByTime(0)
    expect(hookInterface.get('value')).toBe(3)

    // Check for unnecessary renders
    expect(hookInterface.getRenderCount()).toBe(2)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
