import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { useReducer } from 'react'
import { forceUpdateReducer } from '../../../src/internals/custom-hooks'
import { RelinkSource } from '../../../src/schema'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objective: Check if state values reference to the same object if
// component is re-rendered due to external factors.

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useRelinkValue } = Relink

  let Source: RelinkSource<SampleSchema>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  describe('If no state change, value should be same across renders', (): void => {

    test('Without selector', async (): Promise<void> => {

      Source = createSource<SampleSchema>({
        key: 'test/api-useRelinkValue/external-state-change',
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

    test('With selector', async (): Promise<void> => {

      Source = createSource<SampleSchema>({
        key: 'test/api-useRelinkValue/external-state-change',
        default: {
          foo: 1,
          bar: 1,
        },
      })

      function useCompoundHook() {
        const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
        const state = useRelinkValue(Source, (s) => ({ foo: s.foo }))
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
