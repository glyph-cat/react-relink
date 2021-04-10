import { createCompoundHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {
  describe('useRelinkState', () => {
    it('Different sources, no extra re-renders 2', () => {
      const SourceA = Relink.createSource({
        default: 1,
      })
      const SourceB = Relink.createSource({
        default: 2,
      })

      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: Relink.useRelinkState,
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
            method: Relink.useRelinkState,
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
