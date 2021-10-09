import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { RelinkSource } from '../../../src/schema'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// TODO
// Test objectives:
// * ...

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useRelinkValue } = Relink

  let Source: RelinkSource<number>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test.skip('Not ready', (): void => {
    Source = createSource({
      key: 'test/api-useRelinkValue',
      default: null,
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        main() {
          return null
        },
      },
    }, cleanupRef)
    expect(hookInterface.get('main')).toBe(null)
  })

})
