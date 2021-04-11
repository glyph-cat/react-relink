import { createHookInterface } from '../../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkState } = Relink
  describe('useRelinkState', () => {
    it('With selector', () => {
      const Source = createSource({
        default: { a: 1, b: 2 },
      })

      const hookInterface = createHookInterface({
        hook: {
          method: useRelinkState,
          props: [Source, ({ b }) => b],
        },
        actions: {
          step: ({ H }) => {
            const [, setState] = H
            setState((oldState) => ({ ...oldState, b: oldState.b + 1 }))
          },
          replace: ({ H }) => {
            const [, setState] = H
            setState({ a: 1, b: 5 })
          },
        },
        values: {
          b: (H) => {
            const [value] = H
            return value
          },
        },
      })

      // Initial phase
      expect(hookInterface.get('b')).toBe('2')

      // Update phase - callback
      hookInterface.actions('step')
      expect(hookInterface.get('b')).toBe('3')

      // Update phase - replace value
      hookInterface.actions('replace')
      expect(hookInterface.get('b')).toBe('5')

      hookInterface.cleanup()
    })
  })
}
