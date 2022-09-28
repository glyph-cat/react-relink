import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { useState } from 'react'
import { act } from 'react-test-renderer'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objective: Check if state values are returned as expected

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkValue } = Relink

  let Source: $RelinkSource<SampleSchema>
  const cleanupRef = createCleanupRef()
  afterEach(async (): Promise<void> => {
    await Source.dispose()
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

  test('`active` parameter', async (): Promise<void> => {

    Source = new RelinkSource<SampleSchema>({
      key: 'test/api-useRelinkValue/active-parameter',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    const hookInterface = createHookInterface({
      useHook: () => {
        const [active, setActive] = useState(true)
        const state = useRelinkValue(Source, null, active)
        return { state, setActive }
      },
      values: {
        main({ hookData }) {
          return hookData.state
        },
      },
      actions: {
        setActiveToFalse({ hookData }) {
          hookData.setActive(false)
        },
        setActiveToTrue({ hookData }) {
          hookData.setActive(true)
        },
      },
    }, cleanupRef)

    // Make sure hook returns correct value.
    expect(hookInterface.getRenderCount()).toBe(1)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 1,
      bar: 1,
    })

    // `active=true` Make sure hook updates when state changes.
    await act(async () => {
      await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
    })
    expect(hookInterface.getRenderCount()).toBe(2)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 2,
      bar: 1,
    })

    // `active=false` Make sure hook DOES NOT UPDATE when state changes.
    hookInterface.actions('setActiveToFalse')
    expect(hookInterface.getRenderCount()).toBe(3)
    // ^ render count increases because `active` is a state
    await act(async () => {
      await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
    })
    expect(hookInterface.getRenderCount()).toBe(3)
    // ^ but render count does not increase when the state of source changes.
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 2,
      bar: 1,
    })

    // Make sure hook updates immediately when `active=true`.
    hookInterface.actions('setActiveToTrue')
    expect(hookInterface.getRenderCount()).toBe(4)
    expect(hookInterface.get('main')).toStrictEqual({
      foo: 3,
      bar: 1,
    })

  })

})
