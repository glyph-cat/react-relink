import { createHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {
  it('With Virtual Batch', () => {
    jest.useFakeTimers()
    const Source = Relink.createSource({
      default: 1,
    })
    const hookInterface = createHookInterface({
      hook: {
        method: Relink.useRelinkState,
        props: [Source],
      },
      actions: {
        step: ({ H }) => {
          const [, setCounter] = H
          setCounter((c) => c + 1)
        },
      },
      values: {
        value: (H) => {
          const [counter] = H
          return counter
        },
      },
    })

    // Initial phase
    expect(hookInterface.getRenderCount()).toBe(1)

    // Update (Invoke 'step' twice in the same `act()` callback)
    hookInterface.actions(['step', 'step'])
    jest.advanceTimersByTime()
    expect(hookInterface.get('value')).toBe('3')

    // Check for unnecessary renders
    expect(hookInterface.getRenderCount()).toBe(2)

    hookInterface.cleanup()
  })
}
