import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { useCallback, useReducer } from 'react'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { forceUpdateReducer } from '../../../src/internals/custom-hooks'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objective: Check if state values reference to the same object if
// component is re-rendered due to external factors.

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, useRelinkValue } = Relink

  let Source: $RelinkSource<SampleSchema>
  const cleanupRef = createCleanupRef()
  afterEach(async () => {
    await Source.dispose()
    cleanupRef.run()
  })

  describe('If no state change, value should be same across renders', () => {

    test('Without selector', async () => {

      Source = new RelinkSource<SampleSchema>({
        key: 'test/api-useRelinkValue/external-state-change/without-selector',
        default: {
          foo: 1,
          bar: 1,
        },
      })

      function useCompoundHook() {
        const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
        const state = useRelinkValue(Source)
        return [state, forceUpdate] as const
      }

      const hookInterface = createHookInterface({
        useHook: useCompoundHook,
        values: {
          main({ hookData }) {
            const [state] = hookData
            return state
          },
        },
        actions: {
          forceUpdate({ hookData }) {
            const [, forceUpdate] = hookData
            forceUpdate()
          },
        },
      }, cleanupRef)

      const firstSnapshot = hookInterface.get('main')
      hookInterface.actions('forceUpdate')
      const secondSnapshot = hookInterface.get('main')
      expect((Object.is(firstSnapshot, secondSnapshot))).toBe(true)

    })

    test('With selector', async () => {

      Source = new RelinkSource<SampleSchema>({
        key: 'test/api-useRelinkValue/external-state-change/with-selector',
        default: {
          foo: 1,
          bar: 1,
        },
      })

      function useCompoundHook() {
        const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
        // NOTE: Selector should be memoized or declared outside of component.
        const selector = useCallback((s: SampleSchema) => ({ foo: s.foo }), [])
        const state = useRelinkValue(Source, selector)
        return [state, forceUpdate] as const
      }

      const hookInterface = createHookInterface({
        useHook: useCompoundHook,
        values: {
          main({ hookData }) {
            const [state] = hookData
            return state
          },
        },
        actions: {
          forceUpdate({ hookData }) {
            const [, forceUpdate] = hookData
            forceUpdate()
          },
        },
      }, cleanupRef)

      const firstSnapshot = hookInterface.get('main')
      hookInterface.actions('forceUpdate')
      const secondSnapshot = hookInterface.get('main')
      expect((Object.is(firstSnapshot, secondSnapshot))).toBe(true)

    })

  })

})
