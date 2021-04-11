import { createHookInterface } from '../../../__utils__/hook-interface'
import { getFreshTestData } from '../../test-data'

export default function ({ Relink }) {
  const { createSource, useRelinkState } = Relink
  it('Complex object', () => {
    const Source = createSource({
      default: getFreshTestData(),
    })
    const hookInterface = createHookInterface({
      hook: {
        method: useRelinkState,
        props: [Source],
      },
      actions: {
        setState: ({ H }) => {
          const [, updateState] = H
          updateState(getFreshTestData())
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
