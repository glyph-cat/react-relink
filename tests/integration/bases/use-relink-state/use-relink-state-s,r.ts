import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../constants'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  test('With selector, No unnecessary re-rendering', () => {

    const Source = createSource({
      key: `test/${useRelinkState.name}-s,r`,
      default: { a: 1, b: 2 },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source, ({ a }) => a),
      actions: {
        step: ({ hookData }) => {
          const [, setState] = hookData
          setState((oldState) => ({ ...oldState, b: oldState.b + 1 }))
        },
      },
      values: {
        value: ({ hookData }) => {
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
