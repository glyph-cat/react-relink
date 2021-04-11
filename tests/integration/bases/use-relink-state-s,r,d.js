import { createCompoundHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkState } = Relink
  describe('useRelinkState', () => {
    it('Different sources, no extra re-renders 2', () => {
      const SourceA = createSource({
        default: 1,
      })
      const SourceB = createSource({
        default: 2,
      })

      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: useRelinkState,
            props: [SourceA],
          },
          actions: {
            step: ({ H }) => {
              const [, setState] = H
              setState((c) => c + 1)
            },
          },
        },
        b: {
          hook: {
            method: useRelinkState,
            props: [SourceB],
          },
        },
      })

      compoundHookInterface.at('a').actions('step')
      expect(compoundHookInterface.at('b').getRenderCount()).toBe(1)
      compoundHookInterface.cleanup()
    })
  })
}
