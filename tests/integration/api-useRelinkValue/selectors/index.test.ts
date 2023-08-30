import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { act } from 'react-test-renderer'
import {
  RelinkSource as $RelinkSource,
  RELINK_COMPARE_FN_PRESET,
} from '../../../../src/bundle'
import { IntegrationTestConfig, ISampleState } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, useRelinkValue, RelinkAdvancedSelector } = Relink

  let Source: $RelinkSource<ISampleState>
  const cleanupRef = createCleanupRef()
  beforeEach(() => {
    Source = new RelinkSource<ISampleState>({
      key: 'test/api-useRelinkValue/selector',
      default: {
        foo: 1,
        bar: 1,
      },
    })
  })
  afterEach(async () => {
    await Source.dispose()
    cleanupRef.run()
  })

  test('RelinkBasicSelector', async () => {

    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source, (s) => s.bar),
      values: {
        main({ hookData }) {
          return hookData
        },
      },
    }, cleanupRef)

    // Make sure correct value is returned.
    expect(hookInterface.getRenderCount()).toBe(1)
    expect(hookInterface.get('main')).toBe(1)

    // Make sure hook only updates if selected value has changed.
    await act(async () => {
      await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
    })
    expect(hookInterface.get('main')).toBe(1)
    expect(hookInterface.getRenderCount()).toBe(1)
    await act(async () => {
      await Source.set((s) => ({ ...s, bar: s.bar + 1 }))
    })
    expect(hookInterface.get('main')).toBe(2)
    expect(hookInterface.getRenderCount()).toBe(2)

  })

  describe(RelinkAdvancedSelector.name, () => {

    test('Simulation of `RelinkBasicSelector`', async () => {

      const selector = new RelinkAdvancedSelector<ISampleState, ISampleState['bar']>({
        get(state) {
          return state.bar
        }
      })

      const hookInterface = createHookInterface({
        useHook: () => useRelinkValue(Source, selector),
        values: {
          main({ hookData }) {
            return hookData
          },
        },
      }, cleanupRef)

      // Make sure correct value is returned.
      expect(hookInterface.getRenderCount()).toBe(1)
      expect(hookInterface.get('main')).toBe(1)

      // Make sure hook only updates if selected value has changed.
      await act(async () => {
        await Source.set((s) => ({ ...s, foo: s.foo + 1 }))
      })
      expect(hookInterface.get('main')).toBe(1)
      expect(hookInterface.getRenderCount()).toBe(1)
      await act(async () => {
        await Source.set((s) => ({ ...s, bar: s.bar + 1 }))
      })
      expect(hookInterface.get('main')).toBe(2)
      expect(hookInterface.getRenderCount()).toBe(2)

    })

    test('Custom equality checker', async () => {

      const selector = new RelinkAdvancedSelector<ISampleState, ISampleState>({
        get(state) {
          return state
        },
        compareFn: RELINK_COMPARE_FN_PRESET.shallowCompareObject,
      })

      const hookInterface = createHookInterface({
        useHook: () => useRelinkValue(Source, selector),
        values: {
          main({ hookData }) {
            return hookData
          },
        },
      }, cleanupRef)

      // Make sure correct value is returned.
      expect(hookInterface.getRenderCount()).toBe(1)
      expect(hookInterface.get('main')).toStrictEqual({ foo: 1, bar: 1 })

      // Make sure hook does not update for this selector because of the `compareFn`
      // because `Object.is` is not used on the state itself, but it's children.
      await act(async () => {
        await Source.set((s) => ({ ...s }))
      })
      expect(hookInterface.getRenderCount()).toBe(1)
      expect(hookInterface.get('main')).toStrictEqual({ foo: 1, bar: 1 })

    })

  })

})
