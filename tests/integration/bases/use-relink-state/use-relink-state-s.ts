import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  test('With selector', () => {

    const Source = createSource({
      key: `test/${useRelinkState.name}-s`,
      default: { a: 1, b: 2 },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source, ({ b }) => b),
      actions: {
        step: ({ hookData }) => {
          const [, setState] = hookData
          setState((oldState) => ({ ...oldState, b: oldState.b + 1 }))
        },
        replace: ({ hookData }) => {
          const [, setState] = hookData
          setState({ a: 1, b: 5 })
        },
      },
      values: {
        b: ({ hookData }) => {
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
    expect(hookInterface.get('b')).toBe(5)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
