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
  test('Different sources, No unnecessary re-rendering 2', (): void => {

    const SourceA = createSource({
      key: `test/${TEST_METHOD_NAME}-s,r,d/SourceA`,
      default: 1,
    })

    const SourceB = createSource({
      key: `test/${TEST_METHOD_NAME}-s,r,d/SourceB`,
      default: 2,
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useRelinkState(SourceA),
      actions: {
        step: ({ hookData }): void => {
          const [, setState] = hookData
          setState((c) => c + 1)
        },
      },
    }, cleanupRef)

    const hookInterfaceB = createHookInterface({
      useHook: () => useRelinkState(SourceB),
    }, cleanupRef)

    hookInterfaceA.actions('step')
    expect(hookInterfaceB.getRenderCount()).toBe(1)

    // Cleanup
    SourceA.UNSTABLE_cleanup()
    SourceB.UNSTABLE_cleanup()

  })
}
