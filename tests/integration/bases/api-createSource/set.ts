import { RelinkSource } from '../../../../src'
import { IntegrationTestProps, SampleSchema } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  describe('Source.set()', (): void => {

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
        const promise = Source.set({
          foo: 2,
          bar: 2
        })
        // State should change immediately because there are no queued state
        // changes and this is a direct set.
        expect(Source.get()).toStrictEqual({ foo: 2, bar: 2 })
        expect(await (Source.getAsync())).toStrictEqual({ foo: 2, bar: 2 })
        expect(await promise).toBe(undefined)
      })

      test('Reducer', async (): Promise<void> => {
        const promise = Source.set((state) => ({
          ...state,
          bar: state.bar + 1,
        }))
        // State should change immediately because there are no queued state
        // changes and this a synchronous reducer.
        expect(Source.get()).toStrictEqual({ foo: 1, bar: 2 })
        expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
        expect(await promise).toBe(undefined)
      })

      test('Async reducer', async (): Promise<void> => {
        const promise = Source.set(async (state) => ({
          ...state,
          bar: state.bar + 1,
        }))
        // State will not change immediately even though there are no queued
        // state changes but because async reducers create a slight delay.
        expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
        expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
        expect(await promise).toBe(undefined)
      })

    })

    describe('With await', (): void => {

      test('Direct set', async (): Promise<void> => {
        const awaitedPromise = await Source.set({
          foo: 2,
          bar: 2,
        })
        // State change on next line guaranteed because of `await`.
        expect(Source.get()).toStrictEqual({ foo: 2, bar: 2 })
        expect(await (Source.getAsync())).toStrictEqual({ foo: 2, bar: 2 })
        expect(awaitedPromise).toBe(undefined)
      })

      test('Reducer', async (): Promise<void> => {
        const awaitedPromise = await Source.set((state) => ({
          ...state,
          bar: state.bar + 1
        }))
        // State change on next line guaranteed because of `await`.
        expect(Source.get()).toStrictEqual({ foo: 1, bar: 2 })
        expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
        expect(awaitedPromise).toBe(undefined)
      })

      test('Async reducer', async (): Promise<void> => {
        const awaitedPromise = await Source.set(async (state) => ({
          ...state,
          bar: state.bar + 1
        }))
        // State change on next line guaranteed because of `await`.
        expect(Source.get()).toStrictEqual({ foo: 1, bar: 2 })
        expect(await (Source.getAsync())).toStrictEqual({ foo: 1, bar: 2 })
        expect(awaitedPromise).toBe(undefined)
      })

    })

  })

}
