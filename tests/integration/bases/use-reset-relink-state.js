import { createCompoundHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {
  describe('useResetRelinkState', () => {
    it('Normal + no extra re-renders', () => {
      const Source = Relink.createSource({
        default: 1,
      })
      const compoundHookInterface = createCompoundHookInterface({
        a1: {
          hook: {
            method: Relink.useSetRelinkState,
            props: [Source],
          },
          actions: {
            step: ({ H: setState }) => {
              setState(2)
            },
          },
        },
        a2: {
          hook: {
            method: Relink.useResetRelinkState,
            props: [Source],
          },
          actions: {
            reset: ({ H: resetState }) => {
              resetState()
            },
          },
        },
        b: {
          hook: {
            method: Relink.useRelinkValue,
            props: [Source],
          },
          props: [Source],
          values: {
            value: (H) => H,
          },
        },
      })

      // Initial phase
      expect(compoundHookInterface.at('b').get('value')).toBe('1')

      // Update phase
      compoundHookInterface.at('a1').actions('step')
      expect(compoundHookInterface.at('b').get('value')).toBe('2')

      // Reset phase
      compoundHookInterface.at('a2').actions('reset')
      expect(compoundHookInterface.at('b').get('value')).toBe('1')

      // Check if A & B, which only uses the setter & resetter, performs extra re-renders
      expect(compoundHookInterface.at('a1').getRenderCount()).toBe(1)
      expect(compoundHookInterface.at('a2').getRenderCount()).toBe(1)

      compoundHookInterface.cleanup()
    })
  })
}
