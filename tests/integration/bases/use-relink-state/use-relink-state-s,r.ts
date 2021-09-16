import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  const TEST_METHOD_NAME = 'useRelinkState'
  test('With selector, No unnecessary re-rendering', (): void => {

    const Source = createSource({
      key: `test/${TEST_METHOD_NAME}-s,r`,
      default: { a: 1, b: 2 },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source, ({ a }) => a),
      actions: {
        step: ({ hookData }): void => {
          const [, setState] = hookData
          setState((oldState) => ({ ...oldState, b: oldState.b + 1 }))
        },
      },
      values: {
        value: ({ hookData }): number => {
          const [filteredState] = hookData
          return filteredState
        },
      },
    }, cleanupRef)
    hookInterface.actions('step')
    expect(hookInterface.getRenderCount()).toBe(1)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
