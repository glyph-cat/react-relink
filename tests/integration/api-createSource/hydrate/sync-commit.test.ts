import { RelinkSource as $RelinkSource } from '../../../../src/bundle'
import { createEventStackPromise } from '../../../../src/debugging'
import { IntegrationTestConfig, SampleSchema } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, RelinkEventType } = Relink

  let Source: $RelinkSource<SampleSchema>
  afterEach((): void => { Source.cleanup() })

  test('main', async (): Promise<void> => {

    Source = new RelinkSource({
      key: 'test/Source.hydrate()',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    const conclusionRef = { current: null }
    const eventStackPromise = createEventStackPromise(Source, 2)
    const hydrationPromise = Source.hydrate(({ commit }): void => {
      conclusionRef.current = commit
      commit({ foo: 2, bar: 2 })
    })

    expect(Source.get()).toStrictEqual({ foo: 2, bar: 2 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 2, bar: 2 })
    expect(await hydrationPromise).toBe(undefined)
    expect(await eventStackPromise).toStrictEqual([{
      type: RelinkEventType.hydrate,
      state: { foo: 1, bar: 1 },
      isHydrating: true,
    }, {
      type: RelinkEventType.hydrate,
      state: { foo: 2, bar: 2 },
      isHydrating: false,
    }])

    // Try trigger commit again (nothing should happen)
    conclusionRef.current({ foo: 2, bar: 2 })
    expect((await eventStackPromise).length).toBe(2)

  })

})
