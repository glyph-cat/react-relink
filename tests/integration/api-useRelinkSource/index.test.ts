import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import type { RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, useRelinkSource } = Relink

  test('main', async () => {

    const cleanupRef = createCleanupRef()

    const hookInterface = createHookInterface({
      useHook: () => useRelinkSource<number>({
        key: 'test/use-relink-source',
        default: 42,
      }),
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)
    const source = hookInterface.get('main') as RelinkSource<number>
    expect(source instanceof RelinkSource).toBe(true)
    await expect(source.getAsync()).resolves.toBe(42)
    expect(hookInterface.getRenderCount()).toBe(1)

    cleanupRef.run()

  })

})
