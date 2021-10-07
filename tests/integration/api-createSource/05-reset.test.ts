import { RelinkSource } from '../../../src'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// TODO: Test with watchers

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  let Source: RelinkSource<SampleSchema>
  beforeEach(async (): Promise<void> => {
    Source = createSource({
      key: 'test/Source.reset()',
      default: {
        foo: 1,
        bar: 1,
      },
    })
    await Source.set({ foo: 2, bar: 2 })
  })
  afterEach((): void => {
    Source.cleanup()
  })

  test('Without await', async (): Promise<void> => {
    const promise = Source.reset()
    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect((await promise)).toBe(undefined)
  })

  test('With await', async (): Promise<void> => {
    const awaitedPromise = await Source.reset()
    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect(awaitedPromise).toBe(undefined)
  })

})
