import { createHookInterface } from '../../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkValue } = Relink
  it('Normal', () => {
    const Source = createSource({
      default: 1,
    })
    const hookInterface = createHookInterface({
      hook: {
        method: useRelinkValue,
        props: [Source],
      },
      values: {
        value: (H) => H,
      },
    })
    expect(hookInterface.get('value')).toBe('1')
    hookInterface.cleanup()
  })
}
