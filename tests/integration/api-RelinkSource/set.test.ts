import {
  RelinkEventType,
  RelinkSource as $RelinkSource,
} from '../../../src/bundle'
import { createEventLogPromise } from '../../../debugging-utils'
import { IntegrationTestConfig, ISampleState } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  let Source: $RelinkSource<ISampleState>
  beforeEach(() => {
    Source = new RelinkSource({
      key: 'test/Source.set()',
      default: {
        foo: 1,
        bar: 1,
      },
    })
  })
  afterEach(async () => {
    await Source.dispose()
  })

  describe('Without await', () => {

    test('Direct set', async () => {
      const eventPromise = createEventLogPromise(Source)
      const setPromise = Source.set({
        foo: 2,
        bar: 2
      })
      // State should change immediately because there are no queued state
      // changes and this is a direct set.
      expect(Source.get()).toStrictEqual({ foo: 2, bar: 2 })
      expect(await (Source.getAsync())).toStrictEqual({ foo: 2, bar: 2 })
      expect(await setPromise).toBe(undefined)
      expect(await eventPromise).toStrictEqual({
        type: RelinkEventType.set,
        state: { foo: 2, bar: 2 },
      })
    })

    test('Reducer', async () => {
      const eventPromise = createEventLogPromise(Source)
      const setPromise = Source.set((state) => ({
        ...state,
        bar: state.bar + 1,
      }))
      // State should change immediately because there are no queued state
      // changes and this a synchronous reducer.
      expect(Source.get()).toStrictEqual({ foo: 1, bar: 2 })
      expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
      expect(await setPromise).toBe(undefined)
      expect(await eventPromise).toStrictEqual({
        type: RelinkEventType.set,
        state: { foo: 1, bar: 2 },
      })
    })

    test('Async reducer', async () => {
      const eventPromise = createEventLogPromise(Source)
      const promise = Source.set(async (state) => ({
        ...state,
        bar: state.bar + 1,
      }))
      // State will not change immediately even though there are no queued
      // state changes but because async reducers create a slight delay.
      expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
      expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
      expect(await promise).toBe(undefined)
      expect(await eventPromise).toStrictEqual({
        type: RelinkEventType.set,
        state: { foo: 1, bar: 2 },
      })
    })

  })

  describe('With await', () => {

    test('Direct set', async () => {
      const eventPromise = createEventLogPromise(Source)
      const awaitedPromise = await Source.set({
        foo: 2,
        bar: 2,
      })
      // State change on next line guaranteed because of `await`.
      expect(Source.get()).toStrictEqual({ foo: 2, bar: 2 })
      expect(await (Source.getAsync())).toStrictEqual({ foo: 2, bar: 2 })
      expect(awaitedPromise).toBe(undefined)
      expect(await eventPromise).toStrictEqual({
        type: RelinkEventType.set,
        state: { foo: 2, bar: 2 },
      })
    })

    test('Reducer', async () => {
      const eventPromise = createEventLogPromise(Source)
      const awaitedPromise = await Source.set((state) => ({
        ...state,
        bar: state.bar + 1
      }))
      // State change on next line guaranteed because of `await`.
      expect(Source.get()).toStrictEqual({ foo: 1, bar: 2 })
      expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
      expect(awaitedPromise).toBe(undefined)
      expect(await eventPromise).toStrictEqual({
        type: RelinkEventType.set,
        state: { foo: 1, bar: 2 },
      })
    })

    test('Async reducer', async () => {
      const eventPromise = createEventLogPromise(Source)
      const awaitedPromise = await Source.set(async (state) => ({
        ...state,
        bar: state.bar + 1
      }))
      // State change on next line guaranteed because of `await`.
      expect(Source.get()).toStrictEqual({ foo: 1, bar: 2 })
      expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
      expect(awaitedPromise).toBe(undefined)
      expect(await eventPromise).toStrictEqual({
        type: RelinkEventType.set,
        state: { foo: 1, bar: 2 },
      })
    })

  })

})
