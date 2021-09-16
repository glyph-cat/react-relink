import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  test('Simple value', (): void => {

    const Source = createSource({
      key: 'test/same-value-no-update/simple',
      default: 1,
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      actions: {
        setState: ({ hookData }): void => {
          const [, updateState] = hookData
          updateState(1)
        },
      },
    }, cleanupRef)

    // We can spam as many setState called as we like
    hookInterface.actions('setState')
    hookInterface.actions('setState')
    hookInterface.actions('setState')
    // But if the resulting state is the same, no component update should take place
    expect(hookInterface.getRenderCount()).toBe(1)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
