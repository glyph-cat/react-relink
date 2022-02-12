import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { act } from 'react-test-renderer'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objective: Check if state values are returned as expected

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkValue } = Relink

  let Source: $RelinkSource<SampleSchema>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test('Main', async (): Promise<void> => {

    Source = new RelinkSource<SampleSchema>({
      key: 'test/api-useRelinkValue/basic-usage',
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

    // Make sure hook returns correct value.
    expect(hookInterface.getRenderCount()).toBe(1)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 1,
      bar: 1,
    })

    // Make sure hook updates when state changes.
    await act(async () => {
      await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
    })
    expect(hookInterface.getRenderCount()).toBe(2)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 2,
      bar: 1,
    })

    // (Unintended feature)
    // Hook will update if different state object is returned.
    await act(async () => {
      await Source.set((s) => ({ ...s }))
    })
    expect(hookInterface.getRenderCount()).toBe(3)

    // Make sure hook DOES NOT update if same state object is returned.
    await act(async () => {
      await Source.set((s) => { return s })
    })
    expect(hookInterface.getRenderCount()).toBe(3)

  })

})
