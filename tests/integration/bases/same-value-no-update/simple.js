import { createHookInterface } from '../../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkState } = Relink
  it('Simple value', () => {
    const Source = createSource({
      default: 1,
    })
    const hookInterface = createHookInterface({
      hook: {
        method: useRelinkState,
        props: [Source],
      },
      actions: {
        setState: ({ H }) => {
          const [, updateState] = H
          updateState(1)
        },
      },
    })

    // We can spam as many setState called as we like
    hookInterface.actions('setState')
    hookInterface.actions('setState')
    hookInterface.actions('setState')
    // But if the resulting state is the same, no component update should take place
    expect(hookInterface.getRenderCount()).toBe(1)

    hookInterface.cleanup()
  })
}
