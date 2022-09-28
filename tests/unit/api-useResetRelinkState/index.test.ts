import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure the returned hook data is a setter; Use `Object.is` to check
// * Check if components have unnecessary renders (it should not watch for state
//   changes)

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, useResetRelinkState } = Relink

  let Source: $RelinkSource<number>
  const cleanupRef = createCleanupRef()
  afterEach(async (): Promise<void> => {
    await Source.dispose()
    cleanupRef.run()
  })

  test('main', async (): Promise<void> => {
    Source = new RelinkSource({
      key: 'test/use-reset-relink-state',
      default: 1,
    })
    const hookInterface = createHookInterface({
      useHook: () => useResetRelinkState(Source),
      actions: {
        async resetState({ hookData }): Promise<void> {
          const resetState = hookData
          await resetState()
        }
      },
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)
    expect(Object.is(hookInterface.get('main'), Source.reset)).toBe(true)
    await hookInterface.actionsAsync('resetState')
    expect(hookInterface.getRenderCount()).toBe(1)
  })

})