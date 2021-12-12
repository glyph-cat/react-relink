import { createEventStackPromise } from '../../../../src/debugging'
import { RelinkEventType, RelinkSource } from '../../../../src/schema'
import { IntegrationTestConfig, SampleSchema } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  let Source: RelinkSource<SampleSchema>
  afterEach((): void => { Source.cleanup() })

  test('main', async (): Promise<void> => {

    Source = createSource({
      key: 'test/Source.hydrate()',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    const conclusionRef = { current: null }
    const eventStackPromise = createEventStackPromise(Source, 2)
    const hydrationPromise = Source.hydrate(({ skip }): void => {
      conclusionRef.current = skip
      skip()
    })

    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect(await eventStackPromise).toStrictEqual([{
      type: RelinkEventType.hydrate,
      state: { foo: 1, bar: 1 },
      isHydrating: true,
    }, {
      type: RelinkEventType.hydrate,
      state: { foo: 1, bar: 1 },
      isHydrating: false,
    }])
    expect(await hydrationPromise).toBe(undefined)

    // Try trigger commit again (nothing should happen)
    conclusionRef.current()
    expect((await eventStackPromise).length).toBe(2)

  })

})