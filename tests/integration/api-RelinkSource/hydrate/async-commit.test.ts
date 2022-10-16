import { delay } from '@glyph-cat/swiss-army-knife'
import { RelinkSource as $RelinkSource } from '../../../../src/bundle'
import { createEventStackPromise, TIME_GAP } from '../../../../src/debugging'
import { IntegrationTestConfig, SampleSchema } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, RelinkEventType } = Relink

  jest.useRealTimers()

  let Source: $RelinkSource<SampleSchema>
  afterEach(async () => {
    await Source.dispose()
  })

  test('main', async () => {

    Source = new RelinkSource({
      key: 'test/Source.hydrate()',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    const conclusionRef = { current: null }
    const eventStackPromise = createEventStackPromise(Source, 2)
    const hydrationPromise = Source.hydrate(async ({ commit }) => {
      conclusionRef.current = commit
      await delay(TIME_GAP(1))
      commit({ foo: 2, bar: 2 })
    })

    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 2, bar: 2 })
    expect(await eventStackPromise).toStrictEqual([{
      type: RelinkEventType.hydrate,
      state: { foo: 1, bar: 1 },
      isHydrating: true,
    }, {
      type: RelinkEventType.hydrate,
      state: { foo: 2, bar: 2 },
      isHydrating: false,
    }])
    expect(await hydrationPromise).toBe(undefined)

    // Try trigger commit again (nothing should happen)
    conclusionRef.current({ foo: 2, bar: 2 })
    expect((await eventStackPromise).length).toBe(2)

  })

})
