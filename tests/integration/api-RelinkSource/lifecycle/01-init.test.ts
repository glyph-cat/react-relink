import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { act } from 'react-test-renderer'
import {
  TIME_GAP,
  createEventLogPromise,
  delay,
} from '../../../../debugging-utils'
import type { RelinkSource } from '../../../../src/bundle'
import { IntegrationTestConfig } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, RelinkEventType, useRelinkValue } = Relink

  jest.useRealTimers()

  let Source: RelinkSource<number> = null
  const cleanupRef = createCleanupRef()
  afterEach(async () => {
    await Source.dispose()
    Source = null
    cleanupRef.run()
  })

  test('Synchronous commit', async () => {

    Source = new RelinkSource({
      key: 'test/Source/lifecycle.init/sync/commit',
      default: null,
      lifecycle: {
        init({ commit }) {
          act(() => {
            commit(1)
          })
        },
      },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        main({ hookData }): number {
          const state = hookData
          return state
        },
      },
    }, cleanupRef)

    expect(Source.get()).toBe(1)
    expect((await Source.getAsync())).toBe(1)
    expect(hookInterface.get('main')).toBe(1)
    // NOTE: `eventPromise` is not tested here because the source would have
    // finished hydrating (synchronously) by the time `RelinkSource` is called.

  })

  test('Synchronous commitNoop', async () => {

    Source = new RelinkSource({
      key: 'test/RelinkSource/lifecycle.init/sync/commitNoop',
      default: null,
      lifecycle: {
        init({ commitNoop }) {
          act(() => {
            commitNoop()
          })
        },
      },
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        main({ hookData }): number {
          const state = hookData
          return state
        },
      },
    }, cleanupRef)

    expect(Source.get()).toBe(null)
    expect((await Source.getAsync())).toBe(null)
    expect(hookInterface.get('main')).toBe(null)
    // NOTE: `eventPromise` is not tested here because the source would have
    // finished hydrating (synchronously) by the time `RelinkSource` is called.

  })

  test('Asynchronous commit', async () => {

    Source = new RelinkSource({
      key: 'test/Source/lifecycle.init/async/commit',
      default: null,
      lifecycle: {
        async init({ commit }) {
          await act(async () => {
            await delay(TIME_GAP(1))
            commit(1)
          })
        },
      },
    })

    const eventPromise = createEventLogPromise(Source)
    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        main({ hookData }): number {
          const state = hookData
          return state
        },
      },
    }, cleanupRef)

    expect(Source.get()).toBe(null)
    expect(hookInterface.get('main')).toBe(null)
    expect((await Source.getAsync())).toBe(1)
    expect(hookInterface.get('main')).toBe(1)
    expect(await eventPromise).toStrictEqual({
      type: RelinkEventType.hydrate,
      state: 1,
      isHydrating: false
    })

  })

  test('Asynchronous commitNoop', async () => {

    Source = new RelinkSource({
      key: 'test/Source/lifecycle.init/async/commitNoop',
      default: null,
      lifecycle: {
        async init({ commitNoop }) {
          await act(async () => {
            await delay(TIME_GAP(1))
            commitNoop()
          })
        },
      },
    })

    const eventPromise = createEventLogPromise(Source)
    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        main({ hookData }): number {
          const state = hookData
          return state
        },
      },
    }, cleanupRef)

    expect(Source.get()).toBe(null)
    expect(hookInterface.get('main')).toBe(null)
    expect((await Source.getAsync())).toBe(null)
    expect(hookInterface.get('main')).toBe(null)
    expect(await eventPromise).toStrictEqual({
      type: RelinkEventType.hydrate,
      state: null,
      isHydrating: false
    })

  })

})
