import { createSource } from '../../../src/source'

describe('Mutability', () => {
  describe('Create', () => {
    it('Mutable', () => {
      const defaultValue = { value: 1 }
      const sh = createSource({
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
      const sh = createSource({
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
      const sh = createSource({
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
      const sh = createSource({
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
