import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { RelinkSource } from '../../../src/schema'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// TODO
// Test objectives:
// * Check if state values are returned as expected
// * Check if state values passed into selectors are direct references of the
//   internal state

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useRelinkValue } = Relink

  let Source: RelinkSource<SampleSchema>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  // KIV
  test('Not ready', (): void => {
    Source = createSource<SampleSchema>({
      key: 'test/api-useRelinkValue',
      default: {
        foo: 1,
        bar: 1,
      },
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 1,
      bar: 1,
    })
  })

})
