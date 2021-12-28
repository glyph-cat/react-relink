import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { RelinkSource } from '../../../src/schema'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objective: Check if state values are returned as expected

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useRelinkValue } = Relink

  let Source: RelinkSource<SampleSchema>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test('Basic Usage', async (): Promise<void> => {

    Source = createSource<SampleSchema>({
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
    await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
    expect(hookInterface.getRenderCount()).toBe(2)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 2,
      bar: 1,
    })

    // (Unintended feature)
    // Hook will update if different state object is returned.
    await Source.set((s) => ({ ...s }))
    expect(hookInterface.getRenderCount()).toBe(3)

    // Make sure hook DOES NOT update if same state object is returned.
    await Source.set((s) => { return s })
    expect(hookInterface.getRenderCount()).toBe(3)

  })

  test('With selector', async (): Promise<void> => {

    Source = createSource<SampleSchema>({
      key: 'test/api-useRelinkValue/with-selector',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source, (s) => s.bar),
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)

    // Make sure hook returns correct value.
    expect(hookInterface.getRenderCount()).toBe(1)
    expect(hookInterface.get('main')).toBe(1)

    // Make sure hook only updates if selected value has changed.
    await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
    expect(hookInterface.getRenderCount()).toBe(2)
    await Source.set((s) => ({ ...s, bar: s.bar + 1 }))
    expect(hookInterface.getRenderCount()).toBe(3)
    expect(hookInterface.get('main')).toBe(2)

  })

})
