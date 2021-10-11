import {
  createHookInterface,
  createCleanupRef,
} from '@chin98edwin/react-test-utils'
import { act } from 'react-test-renderer'
import { RelinkSource } from '../../../../src/schema'
import { createEventPromise, delay, TIME_GAP } from '../../../../src/debugging'
import { IntegrationTestConfig } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, RelinkEventType, useRelinkValue } = Relink

  let Source: RelinkSource<number>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test('Synchronous commit', async (): Promise<void> => {

    Source = createSource({
      key: 'test/Source/lifecycle.init/sync/commit',
      default: null,
      lifecycle: {
        init({ commit }): void {
          act((): void => {
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
    // finished hydrating (synchronously) by the time `createSource` is called.

  })

  test('Synchronous skip', async (): Promise<void> => {

    Source = createSource({
      key: 'test/Source/lifecycle.init/sync/skip',
      default: null,
      lifecycle: {
        init({ skip }): void {
          act((): void => {
            skip()
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
    // finished hydrating (synchronously) by the time `createSource` is called.

  })

  test.skip('Synchronous commit (delayed)', async (): Promise<void> => {
    // TODO
  })

  test.skip('Synchronous skip (delayed)', async (): Promise<void> => {
    // TODO
  })

  test('Asynchronous commit', async (): Promise<void> => {

    Source = createSource({
      key: 'test/Source/lifecycle.init/async/commit',
      default: null,
      lifecycle: {
        async init({ commit }): Promise<void> {
          await act(async (): Promise<void> => {
            await delay(TIME_GAP(1))
            commit(1)
          })
        },
      },
    })

    const eventPromise = createEventPromise(Source)
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

  test('Asynchronous skip', async (): Promise<void> => {

    Source = createSource({
      key: 'test/Source/lifecycle.init/async/commit',
      default: null,
      lifecycle: {
        async init({ skip }): Promise<void> {
          await act(async (): Promise<void> => {
            await delay(TIME_GAP(1))
            skip()
          })
        },
      },
    })

    const eventPromise = createEventPromise(Source)
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