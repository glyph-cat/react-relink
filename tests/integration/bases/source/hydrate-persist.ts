import { IntegrationTestProps } from '../../../helpers'
import { MOCK_SERVER_RESPONSE_TIME, PADDING_TIME } from './constants'

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

    test('Promise.then', (): Promise<void> => {
      jest.useRealTimers()
      let mockStorage = null
      const hydrationValue = 2

      const getValueFromMockServer = (): Promise<number> =>
        new Promise((resolve): void => {
          setTimeout((): void => {
            resolve(hydrationValue)
          }, MOCK_SERVER_RESPONSE_TIME)
        })

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

      return new Promise((resolve): void => {
        setTimeout((): void => {
          // Hydration - Wait for "server" to return value
          const hydratedValue = Source.get()
          expect(hydratedValue).toBe(hydrationValue)
          // Persistence
          const newPersistedValue = 3
          Source.set(newPersistedValue)
          setTimeout((): void => {
            expect(mockStorage).toBe(newPersistedValue)
            // Reset
            setTimeout((): void => {
              Source.reset()
              expect(mockStorage).toBe(null)
              resolve()
              // Cleanup
              Source.UNSTABLE_cleanup()
            }, PADDING_TIME)
          }, PADDING_TIME)
        }, MOCK_SERVER_RESPONSE_TIME + PADDING_TIME)
      })
    })

    test('Asynchronous', async (): Promise<void> => {
      jest.useRealTimers()
      let mockStorage = null
      const hydrationValue = 2

      const getValueFromMockServer = (): Promise<number> => {
        return new Promise((resolve): void => {
          setTimeout((): void => {
            resolve(hydrationValue)
          }, MOCK_SERVER_RESPONSE_TIME)
        })
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

      return new Promise((resolve): void => {
        setTimeout((): void => {
          // Hydration - Wait for "server" to return value
          const hydratedValue = Source.get()
          expect(hydratedValue).toBe(hydrationValue)
          // Persistence
          const newPersistedValue = 3
          Source.set(newPersistedValue)
          setTimeout((): void => {
            expect(mockStorage).toBe(newPersistedValue)
            setTimeout((): void => {
              Source.reset()
              expect(mockStorage).toBe(null)
              resolve()
            }, PADDING_TIME)
          }, PADDING_TIME)
        }, MOCK_SERVER_RESPONSE_TIME + PADDING_TIME)
      })
    })

  })
}
