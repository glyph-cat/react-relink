import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure the returned hook data is a setter

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkState } = Relink

  let Source: $RelinkSource<number>
  const cleanupRef = createCleanupRef()
  afterEach(async () => {
    await Source.dispose()
    cleanupRef.run()
  })

  test('main', (): void => {
    Source = new RelinkSource({
      key: 'test/use-relink-state',
      default: 1,
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)
    expect(hookInterface.get('main')[0]).toBe(Source.get())
    expect(Object.is(hookInterface.get('main')[1], Source.set)).toBe(true)
    expect(Object.is(hookInterface.get('main')[2], Source.reset)).toBe(true)
  })

})
