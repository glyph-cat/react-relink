import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { RelinkSource } from '../../../src'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure the returned hook data is a setter; Use `Object.is` to check
// * Check if components go into suspense or have unnecessary renders
// KIV ^

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useHydrateRelinkSource } = Relink

  let Source: RelinkSource<number>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test('main', (): void => {
    Source = createSource({
      key: 'test/',
      default: 1,
    })
    const hookInterface = createHookInterface({
      useHook: () => useHydrateRelinkSource(Source),
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)
    expect(Object.is(hookInterface.get('main'), Source.hydrate)).toBe(true)
  })

})
