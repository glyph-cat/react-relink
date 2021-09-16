import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  test('Normal', () => {

    const Source = createSource({
      key: `test/${useRelinkState.name}`,
      default: 1,
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      actions: {
        step: ({ hookData }) => {
          const [, setState] = hookData
          setState((c) => c + 1)
        },
        replace: ({ hookData }) => {
          const [, setState] = hookData
          setState(5)
        },
      },
      values: {
        counter: ({ hookData }) => {
          const [state] = hookData
          return state
        },
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterface.get('counter')).toBe(1)

    // Update phase - callback
    hookInterface.actions('step')
    expect(hookInterface.get('counter')).toBe(2)

    // Update phase - replace value
    hookInterface.actions('replace')
    expect(hookInterface.get('counter')).toBe(5)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
