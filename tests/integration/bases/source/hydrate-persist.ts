import { delay, IntegrationTestProps, TIME_GAP } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource } = Relink
  describe('Hydration & Persistence', (): void => {

    test('Synchronous', (): void => {
      let mockStorage = null
      const hydrationValue = 2

      const Source = createSource({
        key: 'test/hydration/synchronous',
        default: 1,
        lifecycle: {
          init: ({ commit }): void => {
            commit(hydrationValue)
          },
          didSet: ({ state }): void => {
            mockStorage = state
          },
          didReset: (): void => {
            mockStorage = null
          },
        },
      })

      // Hydration - Get value without waiting
      const hydratedValue = Source.get()
      expect(hydratedValue).toBe(hydrationValue)

      // Persistence
      const newPersistedValue = 3
      Source.set(newPersistedValue)
      expect(mockStorage).toBe(newPersistedValue)

      // Reset
      Source.reset()
      expect(mockStorage).toBe(null)

      // Cleanup
      Source.UNSTABLE_cleanup()
    })

    test('Synchronous (with Promise.then)', async (): Promise<void> => {
      jest.useRealTimers()
      let mockStorage = null
      const hydrationValue = 2

      const getValueFromMockServer = async (): Promise<number> => {
        await delay(TIME_GAP(1))
        return hydrationValue
      }

      const Source = createSource({
        key: 'test/hydration/promise.then',
        default: 1,
        lifecycle: {
          init: ({ commit }): void => {
            getValueFromMockServer().then((data): void => {
              commit(data)
            })
          },
          didSet: ({ state }): void => {
            mockStorage = state
          },
          didReset: (): void => {
            mockStorage = null
          },
        },
        options: {
          suspense: true,
        },
      })

      // Hydration - Wait for "server" to return value
      await delay(TIME_GAP(1))
      const hydratedValue = Source.get()
      expect(hydratedValue).toBe(hydrationValue)

      // Persistence
      const newPersistedValue = 3
      Source.set(newPersistedValue)
      expect(mockStorage).toBe(newPersistedValue)

      // Reset
      Source.reset()
      expect(mockStorage).toBe(null)

    })

    test('Asynchronous', async (): Promise<void> => {
      jest.useRealTimers()
      let mockStorage = null
      const hydrationValue = 2

      const getValueFromMockServer = async (): Promise<number> => {
        await delay(TIME_GAP(1))
        return hydrationValue
      }

      const Source = createSource({
        key: 'test/hydration/asynchronous',
        default: 1,
        lifecycle: {
          init: async ({ commit }): Promise<void> => {
            const data = await getValueFromMockServer()
            commit(data)
          },
          didSet: ({ state }): void => {
            mockStorage = state
          },
          didReset: (): void => {
            mockStorage = null
          },
        },
        options: {
          suspense: true,
        },
      })

      // Hydration - Wait for "server" to return value
      await delay(TIME_GAP(1))
      const hydratedValue = Source.get()
      expect(hydratedValue).toBe(hydrationValue)

      // Persistence
      const newPersistedValue = 3
      Source.set(newPersistedValue)
      expect(mockStorage).toBe(newPersistedValue)

      // Reset
      Source.reset()
      expect(mockStorage).toBe(null)

    })

  })
}
