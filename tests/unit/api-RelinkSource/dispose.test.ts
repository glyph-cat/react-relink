import { delay } from '@glyph-cat/swiss-army-knife'
import { TIME_GAP } from '../../../src/debugging'
import { RelinkEvent } from '../../../src/schema'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkEventType, RelinkSource } = Relink

  // NOTE: Setup and teardown are not used here, instead, each source is hard-coded
  // and disposed within the `test` callback because *it is* the `dispose` method
  // that we want to test.

  test('value instanceof RelinkSource', async (): Promise<void> => {
    const Source = new RelinkSource({
      key: 'test/dispose/instanceof',
      default: 1,
    })
    await Source.dispose()
    expect(Source instanceof RelinkSource).toBe(true)
  })

  test('Class methods and properties should be inaccessible', async (): Promise<void> => {
    const Source = new RelinkSource({
      key: 'test/dispose/methods-properties',
      default: 1,
    })
    await Source.dispose()
    expect(typeof Source.get).toBe('undefined')
    expect(typeof Source.getAsync).toBe('undefined')
    expect(typeof Source.set).toBe('undefined')
    expect(typeof Source.reset).toBe('undefined')
    expect(typeof Source.hydrate).toBe('undefined')
    expect(typeof Source.default).toBe('undefined')
    expect(typeof Source.key).toBe('undefined')
    expect(typeof Source.watch).toBe('undefined')
    expect(typeof Source.cleanup).toBe('undefined')
    expect(typeof Source.dispose).toBe('undefined')
    expect(Object.keys(Source).sort()).toStrictEqual([
      // KIV: These keys are still present probably because their value is `undefined`
      'get',
      'getAsync',
      'set',
      'reset',
      'hydrate',
      'cleanup',
      'dispose',
      'watch',
    ].sort())
  })

  test('Listeners should not be active after disposal', async (): Promise<void> => {
    const Source = new RelinkSource({
      key: 'test/dispose/listeners',
      default: 1,
    })
    // NOTE: We are checking if the `dispose` method is able to cover the
    // absence of `unwatch` callback.
    const eventStack: Array<RelinkEvent<number>> = []
    Source.watch((event) => { eventStack.push(event) })
    await Source.dispose()
    const callback = async () => { await Source.set(c => c + 1) }
    expect(callback()).rejects.toThrowError(
      new TypeError('Source.set is not a function')
    )
    expect(eventStack).toStrictEqual([])
  })

  describe('options', (): void => {

    /**
     * Should wait for all gated executions to complete.
     */
    test('.force = false (default)', async (): Promise<void> => {
      const Source = new RelinkSource({
        key: 'test/dispose/options.force=false',
        default: 1,
      })

      let watchedEvent: RelinkEvent<number> = null
      Source.watch((event) => { watchedEvent = event })

      // NOTE: `await` is not used here
      Source.set(async (): Promise<number> => {
        await delay(TIME_GAP(1))
        return 2
      }).catch((e) => { console.log(e) }) // eslint-disable-line no-console
      await Source.dispose()

      expect(watchedEvent).toStrictEqual({
        type: RelinkEventType.set,
        state: 2,
      })

    })

    /**
     * Should not wait for all gated executions to complete.
     */
    test('.force = true', async (): Promise<void> => {
      const Source = new RelinkSource({
        key: 'test/dispose/options.force=true',
        default: 1,
      })

      let watchedEvent: RelinkEvent<number> = null
      Source.watch((event) => { watchedEvent = event })

      // NOTE: `await` is not used here
      Source.set(async (): Promise<number> => {
        await delay(TIME_GAP(1))
        return 2
      }).catch((e) => { console.log(e) }) // eslint-disable-line no-console
      await Source.dispose({ force: true })

      expect(watchedEvent).toBe(null)

    })

  })

  test('Make sure other sources are still intact', async (): Promise<void> => {
    const SourceA = new RelinkSource({
      key: 'test/dispose/pollution-check/a',
      default: 1,
    })

    // NOTE: `SourceB` is created before disposal of `SourceA`, whereas `SourceC`
    // is created after. We want to make sure the disposal of one source has no
    // side effects on other sources regardless of when and how they're created.

    const SourceB = new RelinkSource({
      key: 'test/dispose/pollution-check/b',
      default: 'meow',
    })

    await SourceA.dispose()

    const SourceC = new RelinkSource({
      key: 'test/dispose/pollution-check/c',
      default: { foo: 'bar' },
    })

    expect(SourceB.getAsync()).resolves.toBe('meow')
    expect(SourceC.getAsync()).resolves.toStrictEqual({ foo: 'bar' })

  })

})
