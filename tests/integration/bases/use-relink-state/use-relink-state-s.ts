import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { delay, IntegrationTestProps, TIME_GAP } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  const TEST_METHOD_NAME = 'useRelinkState'
  test('With selector', async (): Promise<void> => {

    const Source = createSource({
      key: `test/${TEST_METHOD_NAME}-s`,
      default: { a: 1, b: 2 },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source, ({ b }) => b),
      actions: {
        step: ({ hookData }): void => {
          const [, setState] = hookData
          setState((oldState) => ({ ...oldState, b: oldState.b + 1 }))
        },
        replace: ({ hookData }): void => {
          const [, setState] = hookData
          setState({ a: 1, b: 5 })
        },
      },
      values: {
        b: ({ hookData }): number => {
          const [value] = hookData
          return value
        },
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterface.get('b')).toBe(2)

    // Update phase - callback
    hookInterface.actions('step')
    expect(hookInterface.get('b')).toBe(3)

    // Update phase - replace value
    hookInterface.actions('replace')
    await delay(TIME_GAP(1)) // KIV: Not sure why this needs await
    expect(hookInterface.get('b')).toBe(5)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
