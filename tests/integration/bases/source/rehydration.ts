import { act } from 'react-test-renderer'
import { IntegrationTestProps } from '../../../helpers'
import { PADDING_TIME } from './constants'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource } = Relink

  describe('Rehydration', (): void => {

    test('Synchronous', (): void => {
      let mockStorage = null
      const Source = createSource({
        key: 'test/rehydration/synchronous',
        default: 0,
        lifecycle: {
          init: ({ commit }): void => {
            const data = 1
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

      act((): void => {
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
      const getValueFromMockServer = (
        mockValue: number,
        mockTimeout: number
      ): Promise<number> => {
        return new Promise((resolve): void => {
          setTimeout((): void => {
            resolve(mockValue)
          }, mockTimeout)
        })
      }

      const Source = createSource({
        key: 'test/rehydration/asynchronous',
        default: 0,
        lifecycle: {
          init: async ({ commit }): Promise<void> => {
            const data = await getValueFromMockServer(1, 0)
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
          act(() => {
            // Expect hydration to use this value...
            Source.hydrate(async ({ commit }): Promise<void> => {
              const data = await getValueFromMockServer(2, PADDING_TIME * 2)
              commit(data)
            })
            // ...while this one is blocked
            Source.hydrate(async ({ commit }): Promise<void> => {
              const data = await getValueFromMockServer(3, PADDING_TIME)
              commit(data)
            })
          })
          setTimeout((): void => {
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