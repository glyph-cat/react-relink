import { createEventLogPromise } from '../../../debugging-utils'
import type { RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig, ISampleState } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, RelinkEventType } = Relink

  let Source: RelinkSource<ISampleState>
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
    const eventPromise = createEventLogPromise(Source)
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
    const eventPromise = createEventLogPromise(Source)
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
