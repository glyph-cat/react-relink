import { createCompoundHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkValue, useSetRelinkState } = Relink
  describe('useRelinkValue', () => {
    it('With selector, no extra re-renders', () => {
      const Source = createSource({
        default: { a: 1, b: 2 },
      })
      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: useRelinkValue,
            props: [Source, ({ b }) => b],
          },
          values: {
            value: (H) => H,
          },
        },
        b: {
          hook: {
            method: useSetRelinkState,
            props: [Source],
          },
          actions: {
            step: ({ H: setState }) => {
              setState((oldState) => ({ ...oldState, a: oldState.a + 1 }))
            },
          },
        },
      })

      compoundHookInterface.at('b').actions('step')
      expect(compoundHookInterface.at('a').getRenderCount()).toBe(1)
      compoundHookInterface.cleanup()
    })
  })
}
