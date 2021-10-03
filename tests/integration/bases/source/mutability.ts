import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  describe('Mutability', (): void => {

    describe('Create', (): void => {

      test('Mutable', (): void => {
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

      test('Immutable', (): void => {
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

    describe('Set', (): void => {

      test('Mutable', (): void => {

        const Source = createSource({
          key: 'test/mutability/set/mutable:true',
          default: { value: 1 },
          options: {
            mutable: true,
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

      test('Immutable', (): void => {

        const Source = createSource({
          key: 'test/mutability/set/mutable:false',
          default: { value: 1 },
          options: {
            mutable: false,
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
