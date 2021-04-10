import { act } from 'react-test-renderer'
import { UNSAFE_createSource } from '../../src/source'

const mockServerResponseTime = 500 // ms
const paddingTime = 100 // ms

describe('Basics', () => {
  it('get', () => {
    const sh = UNSAFE_createSource({
      default: 1,
    })
    const state = sh.get()
    expect(state).toBe(1)
  })

  it('set', () => {
    const sh = UNSAFE_createSource({
      default: 1,
    })
    sh.set(3)
    const state = sh.get()
    expect(state).toBe(3)
  })
})

describe('Hydration & Persistence', () => {
  it('Synchronous', () => {
    let mockStorage = null
    const hydrationValue = 2

    const sh = UNSAFE_createSource({
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
    const hydratedValue = sh.get()
    expect(hydratedValue).toBe(hydrationValue)

    // Persistence
    const newPersistedValue = 3
    sh.set(newPersistedValue)
    expect(mockStorage).toBe(newPersistedValue)

    // Reset
    sh.reset()
    expect(mockStorage).toBe(null)
  })

  it('Promise.then', () => {
    let mockStorage = null
    const hydrationValue = 2

    const getValueFromMockServer = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(hydrationValue)
        }, mockServerResponseTime)
      })

    const sh = UNSAFE_createSource({
      default: 1,
      lifecycle: {
        init: ({ commit }) => {
          getValueFromMockServer().then((data) => {
            commit(data)
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

    return new Promise((resolve) => {
      setTimeout(() => {
        // Hydration - Wait for "server" to return value
        const hydratedValue = sh.get()
        expect(hydratedValue).toBe(hydrationValue)
        // Persistence
        const newPersistedValue = 3
        sh.set(newPersistedValue)
        setTimeout(() => {
          expect(mockStorage).toBe(newPersistedValue)
          // Reset
          setTimeout(() => {
            sh.reset()
            expect(mockStorage).toBe(null)
            resolve()
          }, paddingTime)
        }, paddingTime)
      }, mockServerResponseTime + paddingTime)
    })
  })

  it('Asynchronous', () => {
    let mockStorage = null
    const hydrationValue = 2

    const getValueFromMockServer = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(hydrationValue)
        }, mockServerResponseTime)
      })

    const sh = UNSAFE_createSource({
      default: 1,
      lifecycle: {
        init: async ({ commit }) => {
          const data = await getValueFromMockServer()
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
        // Hydration - Wait for "server" to return value
        const hydratedValue = sh.get()
        expect(hydratedValue).toBe(hydrationValue)
        // Persistence
        const newPersistedValue = 3
        sh.set(newPersistedValue)
        setTimeout(() => {
          expect(mockStorage).toBe(newPersistedValue)
          setTimeout(() => {
            sh.reset()
            expect(mockStorage).toBe(null)
            resolve()
          }, paddingTime)
        }, paddingTime)
      }, mockServerResponseTime + paddingTime)
    })
  })
})

describe('Rehydration', () => {
  it('Synchronous', () => {
    let mockStorage = null
    const sh = UNSAFE_createSource({
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
      sh.hydrate(async ({ commit }) => {
        const data = 2
        commit(data)
      })
      // ...then use this, since it is synchronous
      sh.hydrate(async ({ commit }) => {
        const data = 3
        commit(data)
      })
    })

    expect(sh.get()).toBe(3)
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

    const sh = UNSAFE_createSource({
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
          sh.hydrate(async ({ commit }) => {
            const data = await getValueFromMockServer(2, paddingTime * 2)
            commit(data)
          })
          // ...while this one is blocked
          sh.hydrate(async ({ commit }) => {
            const data = await getValueFromMockServer(3, paddingTime)
            commit(data)
          })
        })
        setTimeout(() => {
          expect(sh.get()).toBe(2)
          expect(mockStorage).toBe(null) // Since it's just hydration
          resolve()
        }, paddingTime * 3)
      }, paddingTime)
    })
  })
})

describe('Mutability', () => {
  describe('Create', () => {
    it('Mutable', () => {
      const defaultValue = { value: 1 }
      const sh = UNSAFE_createSource({
        default: defaultValue,
        options: {
          mutable: true,
        },
      })
      defaultValue.value = 2
      expect(sh.get().value).toBe(2)
    })

    it('Immutable', () => {
      const defaultValue = { value: 1 }
      const sh = UNSAFE_createSource({
        default: defaultValue,
      })
      defaultValue.value = 2
      expect(sh.get().value).toBe(1)
    })
  })

  // NOTE
  // Virtual batching is set to true so that we can check the state in between the updates
  // • The update will not take effect immediately due to virtual batching
  //   This is where we check if the value has been mutated
  // • After calling `jest.advanceTimersyTime()`, the states should've been updated
  //   Another check is made to ensure that the states have been updated correctly

  describe('Set', () => {
    it('Mutable', () => {
      jest.useFakeTimers()
      const sh = UNSAFE_createSource({
        default: { value: 1 },
        options: {
          mutable: true,
          virtualBatch: true,
        },
      })
      sh.set((oldState) => {
        oldState.value = 2
        return oldState
      })

      // Before update
      expect(sh.get().value).toBe(2)
      jest.advanceTimersByTime()

      // After update
      expect(sh.get().value).toBe(2)
    })

    it('Immutable', () => {
      jest.useFakeTimers()
      const sh = UNSAFE_createSource({
        default: { value: 1 },
        options: {
          virtualBatch: true,
        },
      })
      sh.set((oldState) => {
        oldState.value = 2
        return oldState
      })

      // Before update
      expect(sh.get().value).toBe(1)
      jest.advanceTimersByTime()

      // After update
      expect(sh.get().value).toBe(2)
    })
  })
})

it('States are carried forward in the batches', () => {
  jest.useFakeTimers()
  const sh = UNSAFE_createSource({
    default: { a: 1, b: 1 },
    options: { virtualBatch: true },
  })
  sh.set((oldState) => ({ ...oldState, a: oldState.a + 1 }))
  sh.set((oldState) => ({ ...oldState, b: oldState.b + 1 }))
  jest.advanceTimersByTime()
  const state = sh.get()
  expect(state).toStrictEqual({ a: 2, b: 2 })
})
