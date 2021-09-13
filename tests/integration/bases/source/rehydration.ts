import { act } from 'react-test-renderer'
import { IntegrationTestProps } from '../../constants'
import { PADDING_TIME } from './constants'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource } = Relink
  describe('Rehydration', () => {
    test('Synchronous', () => {
      let mockStorage = null
      const Source = createSource({
        key: 'test/rehydration/synchronous',
        default: 0,
        lifecycle: {
          init: ({ commit }) => {
            const data = 1
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

      act(() => {
        // Expect hydration to use this value...
        Source.hydrate(async ({ commit }) => {
          const data = 2
          commit(data)
        })
        // ...then use this, since it is synchronous
        Source.hydrate(async ({ commit }) => {
          const data = 3
          commit(data)
        })
      })

      expect(Source.get()).toBe(3)
      expect(mockStorage).toBe(null) // Since it's just hydration
      // Cleanup
      Source.UNSTABLE_cleanup()
    })

    test('Asynchronous', (): Promise<void> => {
      jest.useRealTimers()
      let mockStorage = null
      const getValueFromMockServer = (mockValue, mockTimeout) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockValue)
          }, mockTimeout)
        })

      const Source = createSource({
        key: 'test/rehydration/asynchronous',
        default: 0,
        lifecycle: {
          init: async ({ commit }) => {
            const data = await getValueFromMockServer(1, 0)
            commit(data as number)
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
          act(() => {
            // Expect hydration to use this value...
            Source.hydrate(async ({ commit }) => {
              const data = await getValueFromMockServer(2, PADDING_TIME * 2)
              commit(data as number)
            })
            // ...while this one is blocked
            Source.hydrate(async ({ commit }) => {
              const data = await getValueFromMockServer(3, PADDING_TIME)
              commit(data as number)
            })
          })
          setTimeout(() => {
            expect(Source.get()).toBe(2)
            expect(mockStorage).toBe(null) // Since it's just hydration
            resolve()
            // Cleanup
            Source.UNSTABLE_cleanup()
          }, PADDING_TIME * 3)
        }, PADDING_TIME)
      })
    })
  })
}
