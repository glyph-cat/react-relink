import { IntegrationTestProps, TIME_GAP } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, isRelinkSource } = Relink

  describe('createSource', (): void => {

    test('With key provided', (): void => {
      const callback = (): void => {
        const Source = createSource({
          key: 'test/with-key-provided',
          default: 1,
        })
        Source.UNSTABLE_cleanup()
      }
      expect(callback).not.toThrow()
    })

    test('With no key provided', (): void => {
      const callback = (): void => {
        const Source = createSource({
          default: 1,
        })
        Source.UNSTABLE_cleanup()
      }
      expect(callback).not.toThrow()
    })

  })

  describe('Source basics', (): void => {

    test('get', (): void => {
      const Source = createSource({
        key: 'test/source.get',
        default: 1,
      })
      const state = Source.get()
      expect(state).toBe(1)
      Source.UNSTABLE_cleanup()
    })

    test('set', (): void => {
      const Source = createSource({
        key: 'test/source.set',
        default: 1,
      })
      Source.set(3)
      const state = Source.get()
      expect(state).toBe(3)
      Source.UNSTABLE_cleanup()
    })

    test('States are carried forward in the batches', (): void => {
      jest.useFakeTimers()
      const Source = createSource({
        key: 'test/batch-carry-forward',
        default: { a: 1, b: 1 },
        options: { virtualBatch: true },
      })
      Source.set((oldState) => ({ ...oldState, a: oldState.a + 1 }))
      Source.set((oldState) => ({ ...oldState, b: oldState.b + 1 }))
      jest.advanceTimersByTime(TIME_GAP(1))
      const state = Source.get()
      expect(state).toStrictEqual({ a: 2, b: 2 })
      Source.UNSTABLE_cleanup()
    })

  })

  const TEST_METHOD_NAME_2 = 'isRelinkSource'
  describe(TEST_METHOD_NAME_2, (): void => {

    test('Should be true', (): void => {
      const Source = createSource({
        key: `test/${TEST_METHOD_NAME_2}`,
        default: { username: 'foo' },
      })
      const output = isRelinkSource(Source)
      expect(output).toBe(true)
    })

    test('Should be false', (): void => {
      const output = isRelinkSource(42)
      expect(output).toBe(false)
    })

  })

}
