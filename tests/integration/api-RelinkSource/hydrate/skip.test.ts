import {
  createEventLogStackPromise,
  createRef,
  delay,
  TIME_GAP,
} from '../../../../debugging-utils'
import { RelinkSource as $RelinkSource } from '../../../../src/bundle'
import { IntegrationTestConfig, SampleSchema } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, RelinkEventType } = Relink

  jest.useRealTimers()

  let Source: $RelinkSource<SampleSchema> = null
  afterEach(async () => {
    await Source.dispose()
    Source = null
  })

  test('Synchronous', async () => {

    Source = new RelinkSource({
      key: 'test/Source.hydrate()/skip-sync',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    // Set a different value first, so that the results of the hydration becomes
    // more obvious.
    await Source.set({ foo: -1, bar: -2 })

    // eslint-disable-next-line @typescript-eslint/ban-types
    const conclusionRef = createRef<Function>()
    const eventStackPromise = createEventLogStackPromise(Source, 2)
    const hydrationPromise = Source.hydrate(({ skip }) => {
      conclusionRef.current = skip
      skip()
    })

    expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect(await eventStackPromise).toStrictEqual([{
      type: RelinkEventType.hydrate,
      state: { foo: -1, bar: -2 },
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

  test('Asynchronous', async () => {

    Source = new RelinkSource({
      key: 'test/Source.hydrate()/skip-async',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    // Set a different value first, so that the results of the hydration becomes
    // more obvious.
    await Source.set({ foo: -1, bar: -2 })

    // eslint-disable-next-line @typescript-eslint/ban-types
    const conclusionRef = createRef<Function>()
    const eventStackPromise = createEventLogStackPromise(Source, 2)
    const hydrationPromise = Source.hydrate(async ({ skip }) => {
      conclusionRef.current = skip
      await delay(TIME_GAP(1))
      skip()
    })

    expect(Source.get()).toStrictEqual({ foo: -1, bar: -2 })
    expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
    expect(await eventStackPromise).toStrictEqual([{
      type: RelinkEventType.hydrate,
      state: { foo: -1, bar: -2 },
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
