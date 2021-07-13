export default function ({ Relink }) {
  const { createSource } = Relink
  it('Source - Watch/Unwatch', () => {
    const sh = createSource({
      default: 1,
    })

    const state = sh.get()
    expect(state).toBe(1)

    // Add listener
    let receivedState = null
    const unwatch = sh.watch((newState) => {
      receivedState = newState
    })

    // Check for change
    sh.set(2)
    expect(receivedState).toBe(2)

    // Remove listener
    unwatch()
    sh.set(3)
    expect(receivedState).toBe(2)
  })
}
