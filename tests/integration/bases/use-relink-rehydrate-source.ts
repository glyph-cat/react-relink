import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../helpers'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRehydrateRelinkSource, useRelinkValue } = Relink
  test(useRehydrateRelinkSource.name, () => {
    let didSetCalled = false

    const Source = createSource({
      key: `test/${useRehydrateRelinkSource.name}/normal`,
      default: 1,
      lifecycle: {
        didSet: () => {
          didSetCalled = true
        },
      },
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useRehydrateRelinkSource(Source),
      actions: {
        rehydrate: ({ hookData: rehydrateSource }) => {
          rehydrateSource(({ commit }) => {
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
