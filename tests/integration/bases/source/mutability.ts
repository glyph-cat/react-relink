import { IntegrationTestProps } from '../../constants'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  describe('Mutability', () => {

    describe('Create', () => {

      test('Mutable', () => {
        const defaultValue = { value: 1 }
        const Source = createSource({
          key: 'test/mutability/create/mutable:true',
          default: defaultValue,
          options: {
            mutable: true,
          },
        })
        defaultValue.value = 2
        expect(Source.get().value).toBe(2)
        // Cleanup
        Source.UNSTABLE_cleanup()
      })

      test('Immutable', () => {
        const defaultValue = { value: 1 }
        const Source = createSource({
          key: 'test/mutability/create/mutable:false',
          default: defaultValue,
          options: {
            mutable: false,
          }
        })
        defaultValue.value = 2
        expect(Source.get().value).toBe(1)
        // Cleanup
        Source.UNSTABLE_cleanup()
      })
    })

    // NOTES:
    // * Virtual batching is enabled so that we can check the state in between
    //   the updates.
    // * The update will not take effect immediately due to virtual batching.
    // * This is where we check if the value has been mutated.
    // * After calling `jest.advanceTimersyTime()`, the states should've been
    //   updated.
    // * Another check is made to ensure that the states have been updated
    //   correctly.

    describe('Set', () => {

      test('Mutable', () => {
        jest.useFakeTimers()
        const Source = createSource({
          key: 'test/mutability/set/mutable:true',
          default: { value: 1 },
          options: {
            mutable: true,
            // virtualBatch: true,
          },
        })

        // Before update
        expect(Source.get().value).toBe(1)

        let sideEffect = (): void => { /**/ }

        // Perform update
        Source.set((oldState) => {
          sideEffect = (): void => { oldState.value = 10 }
          oldState.value = 2
          return oldState
        })
        expect(Source.get().value).toBe(2)

        // Trigger side effect
        sideEffect()
        expect(Source.get().value).toBe(10) // Should be changed to 10

        // Cleanup
        Source.UNSTABLE_cleanup()

      })

      test('Immutable', () => {
        jest.useFakeTimers()
        const Source = createSource({
          key: 'test/mutability/set/mutable:false',
          default: { value: 1 },
          options: {
            mutable: false,
            // virtualBatch: true,
          },
        })

        // Before update
        expect(Source.get().value).toBe(1)

        let sideEffect = (): void => { /**/ }

        // Perform update
        Source.set((oldState) => {
          sideEffect = (): void => { oldState.value = 10 }
          oldState.value = 2
          return oldState
        })
        expect(Source.get().value).toBe(2)

        // Trigger side effect
        sideEffect()
        expect(Source.get().value).toBe(2) // Should remain as 2

        // Cleanup
        Source.UNSTABLE_cleanup()

      })

    })
  })
}
