import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { RelinkSourceSchema } from '../../../src/schema'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure the returned hook data is a setter; Use `Object.is` to check
// * Check if components have unnecessary renders (it should not watch for state
//   changes)

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useHydrateRelinkSource } = Relink

  let Source: RelinkSourceSchema<number>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test('main', async (): Promise<void> => {
    Source = createSource({
      key: 'test/use-hydrate-relink-source',
      default: 1,
    })
    const hookInterface = createHookInterface({
      useHook: () => useHydrateRelinkSource(Source),
      actions: {
        async hydrateCommit({ hookData }): Promise<void> {
          const hydrate = hookData
          await hydrate(({ commit }) => { commit(2) })
        },
        async hydrateSkip({ hookData }): Promise<void> {
          const hydrate = hookData
          await hydrate(({ skip }) => { skip() })
        },
      },
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)
    expect(Object.is(hookInterface.get('main'), Source.hydrate)).toBe(true)
    await hookInterface.actionsAsync('hydrateCommit')
    await hookInterface.actionsAsync('hydrateSkip')
    expect(hookInterface.getRenderCount()).toBe(1)
  })

})
