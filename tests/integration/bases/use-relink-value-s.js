import { createHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {
  describe('useRelinkValue', () => {
    it('With selector', () => {
      const Source = Relink.createSource({
        default: { a: 1, b: 2 },
      })
      const hookInterface = createHookInterface({
        hook: {
          method: Relink.useRelinkValue,
          props: [Source, ({ b }) => b],
        },
        values: {
          value: (H) => H,
        },
      })
      expect(hookInterface.get('value')).toBe('2')
      hookInterface.cleanup()
    })
  })
}
