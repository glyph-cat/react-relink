import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, useRehydrateRelinkSource, useRelinkValue } = Relink

  const TEST_METHOD_NAME = 'useRehydrateRelinkSource'
  test(TEST_METHOD_NAME, (): void => {
    let didSetCalled = false

    const Source = createSource({
      key: `test/${TEST_METHOD_NAME}/normal`,
      default: 1,
      lifecycle: {
        didSet: (): void => {
          didSetCalled = true
        },
      },
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useRehydrateRelinkSource(Source),
      actions: {
        rehydrate: ({ hookData: rehydrateSource }): void => {
          rehydrateSource(({ commit }): void => {
            commit(5)
          })
        },
      },
    }, cleanupRef)

    const hookInterfaceB = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    hookInterfaceA.actions('rehydrate')
    expect(hookInterfaceB.get('value')).toBe(5)
    expect(didSetCalled).toBe(false)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}
