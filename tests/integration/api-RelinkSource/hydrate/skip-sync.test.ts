import { createRef } from '../../../../debugging-utils'
import { RelinkSource as $RelinkSource } from '../../../../src/bundle'
import { createEventStackPromise } from '../../../../src/debugging'
import { IntegrationTestConfig, SampleSchema } from '../../../helpers'
import { wrapper } from '../../wrapper'

// TODO: Also test after setting a value (refer to 'suspense' sandbox in playground)

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, RelinkEventType } = Relink

  let Source: $RelinkSource<SampleSchema>
  afterEach(async () => {
    await Source.dispose()
  })

  test('main', async () => {

    Source = new RelinkSource({
      key: 'test/Source.hydrate()/skip-sync',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    // eslint-disable-next-line @typescript-eslint/ban-types
    const conclusionRef = createRef<Function>()
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
