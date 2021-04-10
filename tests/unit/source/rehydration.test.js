import { act } from 'react-test-renderer'
import { UNSTABLE_createSource as createSource } from '../../../src/source'
import { PADDING_TIME } from './constants'

describe('Rehydration', () => {
  it('Synchronous', () => {
    let mockStorage = null
    const sh = createSource({
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
      sh.M$hydrate(async ({ commit }) => {
        const data = 2
        commit(data)
      })
      // ...then use this, since it is synchronous
      sh.M$hydrate(async ({ commit }) => {
        const data = 3
        commit(data)
      })
    })

    expect(sh.M$get()).toBe(3)
    expect(mockStorage).toBe(null) // Since it's just hydration
  })

  it('Asynchronous', () => {
    let mockStorage = null
    const getValueFromMockServer = (mockValue, mockTimeout) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockValue)
        }, mockTimeout)
      })

    const sh = createSource({
      default: 0,
      lifecycle: {
        init: async ({ commit }) => {
          const data = await getValueFromMockServer(1, 0)
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

    return new Promise((resolve) => {
      setTimeout(() => {
        act(() => {
          // Expect hydration to use this value...
          sh.M$hydrate(async ({ commit }) => {
            const data = await getValueFromMockServer(2, PADDING_TIME * 2)
            commit(data)
          })
          // ...while this one is blocked
          sh.M$hydrate(async ({ commit }) => {
            const data = await getValueFromMockServer(3, PADDING_TIME)
            commit(data)
          })
        })
        setTimeout(() => {
          expect(sh.M$get()).toBe(2)
          expect(mockStorage).toBe(null) // Since it's just hydration
          resolve()
        }, PADDING_TIME * 3)
      }, PADDING_TIME)
    })
  })
})
