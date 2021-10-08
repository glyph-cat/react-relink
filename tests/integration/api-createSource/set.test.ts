import { createEventPromise } from '../../../src/debugging'
import { RelinkEventType, RelinkSource } from '../../../src/schema'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  let Source: RelinkSource<SampleSchema>
  beforeEach((): void => {
    Source = createSource({
      key: 'test/Source.set()',
      default: {
        foo: 1,
        bar: 1,
      },
    })
  })
  afterEach((): void => {
    Source.cleanup()
  })

  describe('Without await', (): void => {

    test('Direct set', async (): Promise<void> => {
      const eventPromise = createEventPromise(Source)
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

    test('Reducer', async (): Promise<void> => {
      const eventPromise = createEventPromise(Source)
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

    test('Async reducer', async (): Promise<void> => {
      const eventPromise = createEventPromise(Source)
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

  describe('With await', (): void => {

    test('Direct set', async (): Promise<void> => {
      const eventPromise = createEventPromise(Source)
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

    test('Reducer', async (): Promise<void> => {
      const eventPromise = createEventPromise(Source)
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

    test('Async reducer', async (): Promise<void> => {
      const eventPromise = createEventPromise(Source)
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
