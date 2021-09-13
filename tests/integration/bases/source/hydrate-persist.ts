import { IntegrationTestProps } from '../../constants'
import { MOCK_SERVER_RESPONSE_TIME, PADDING_TIME } from './constants'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource } = Relink
  describe('Hydration & Persistence', () => {

    test('Synchronous', () => {
      let mockStorage = null
      const hydrationValue = 2

      const Source = createSource({
        key: 'test/hydration/synchronous',
        default: 1,
        lifecycle: {
          init: ({ commit }) => {
            commit(hydrationValue)
          },
          didSet: ({ state }) => {
            mockStorage = state
          },
          didReset: () => {
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

      const getValueFromMockServer = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(hydrationValue)
          }, MOCK_SERVER_RESPONSE_TIME)
        })

      const Source = createSource({
        key: 'test/hydration/promise.then',
        default: 1,
        lifecycle: {
          init: ({ commit }) => {
            getValueFromMockServer().then((data) => {
              commit(data as number)
            })
          },
          didSet: ({ state }) => {
            mockStorage = state
          },
          didReset: () => {
            mockStorage = null
          },
        },
        options: {
          suspense: true,
        },
      })

      return new Promise((resolve): void => {
        setTimeout(() => {
          // Hydration - Wait for "server" to return value
          const hydratedValue = Source.get()
          expect(hydratedValue).toBe(hydrationValue)
          // Persistence
          const newPersistedValue = 3
          Source.set(newPersistedValue)
          setTimeout(() => {
            expect(mockStorage).toBe(newPersistedValue)
            // Reset
            setTimeout(() => {
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

      const getValueFromMockServer = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(hydrationValue)
          }, MOCK_SERVER_RESPONSE_TIME)
        })

      const Source = createSource({
        key: 'test/hydration/asynchronous',
        default: 1,
        lifecycle: {
          init: async ({ commit }) => {
            const data = (await getValueFromMockServer()) as number
            commit(data)
          },
          didSet: ({ state }) => {
            mockStorage = state
          },
          didReset: () => {
            mockStorage = null
          },
        },
        options: {
          suspense: true,
        },
      })

      return new Promise((resolve): void => {
        setTimeout(() => {
          // Hydration - Wait for "server" to return value
          const hydratedValue = Source.get()
          expect(hydratedValue).toBe(hydrationValue)
          // Persistence
          const newPersistedValue = 3
          Source.set(newPersistedValue)
          setTimeout(() => {
            expect(mockStorage).toBe(newPersistedValue)
            setTimeout(() => {
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
