import { createHookInterface } from '../../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkState } = Relink
  describe('useRelinkState', () => {
    it('With selector, No unnecessary re-rendering', () => {
      const Source = createSource({
        default: { a: 1, b: 2 },
      })
      const hookInterface = createHookInterface({
        hook: {
          method: useRelinkState,
          props: [Source, ({ a }) => a],
        },
        actions: {
          step: ({ H }) => {
            const [, setState] = H
            setState((oldState) => ({ ...oldState, b: oldState.b + 1 }))
          },
        },
        values: {
          value: (H) => {
            const [filteredState] = H
            return filteredState
          },
        },
      })
      hookInterface.actions('step')
      expect(hookInterface.getRenderCount()).toBe(1)
      hookInterface.cleanup()
    })
  })
}
