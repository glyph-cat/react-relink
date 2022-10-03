import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { createEventPromise } from '../../../src/debugging'
import { UnitTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: UnitTestConfig): void => {

  const { RelinkSource, RelinkEventType } = Relink

  let Source: $RelinkSource<SampleSchema>
  beforeEach(async () => {
    Source = new RelinkSource({
      key: 'test/Source.reset()',
      default: {
        foo: 1,
        bar: 1,
      },
    })
    // Set a state first so there is something to reset later on
    await Source.set({ foo: 2, bar: 2 })
  })
  afterEach(async () => {
    await Source.dispose()
  })

  test('Without await', async () => {
    const eventPromise = createEventPromise(Source)
    const promise = Source.reset()
    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect((await promise)).toBe(undefined)
    expect(await eventPromise).toStrictEqual({
      type: RelinkEventType.reset,
      state: { foo: 1, bar: 1 },
    })
  })

  test('With await', async () => {
    const eventPromise = createEventPromise(Source)
    const awaitedPromise = await Source.reset()
    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect(awaitedPromise).toBe(undefined)
    expect(await eventPromise).toStrictEqual({
      type: RelinkEventType.reset,
      state: { foo: 1, bar: 1 },
    })
  })

})
