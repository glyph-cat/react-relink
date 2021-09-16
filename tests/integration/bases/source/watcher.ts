import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource } = Relink
  test('Source - Watch/Unwatch', (): void => {
    const Source = createSource({
      key: 'test/watcher',
      default: 1,
    })

    const state = Source.get()
    expect(state).toBe(1)

    // Add listener
    let receivedState = null
    const unwatch = Source.watch((newState): void => {
      receivedState = newState
    })

    // Check for change
    Source.set(2)
    expect(receivedState).toBe(2)

    // Remove listener
    unwatch()
    Source.set(3)
    expect(receivedState).toBe(2)

    // Cleanup
    Source.UNSTABLE_cleanup()
  })
}
