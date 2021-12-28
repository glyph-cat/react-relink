import { createCompoundHookInterface } from '../../../__utils__/hook-interface'

export default function ({ Relink }) {
  const { createSource, useRelinkValue, useSetRelinkState } = Relink
  it('With selector + No unnecessary re-rendering', () => {
    const Source = createSource({
      default: { foo: 1, bar: 2 },
    })

    const compoundHookInterface = createCompoundHookInterface({
      a: {
        hook: {
          method: useRelinkValue,
          props: [Source],
        },
        values: {
          value: (H) => JSON.stringify(H),
        },
      },
      b: {
        hook: {
          method: useRelinkValue,
          props: [Source, ({ bar }) => bar],
        },
        values: {
          value: (H) => H,
        },
      },
      c: {
        hook: {
          method: useSetRelinkState,
          props: [Source],
        },
        actions: {
          step: ({ H: setState }) => {
            setState((oldState) => ({ ...oldState, foo: oldState.foo + 1 }))
          },
        },
      },
    })

    // Check initial value
    expect(compoundHookInterface.at('a').get('value')).toBe(
      JSON.stringify({ foo: 1, bar: 2 })
    )
    expect(compoundHookInterface.at('b').get('value')).toBe('2')

    // Modify state
    compoundHookInterface.at('c').actions('step')

    // Check value again
    expect(compoundHookInterface.at('a').get('value')).toBe(
      JSON.stringify({ foo: 2, bar: 2 })
    )
    expect(compoundHookInterface.at('b').get('value')).toBe('2')

    // Check render count
    expect(compoundHookInterface.at('a').getRenderCount()).toBe(2)
    expect(compoundHookInterface.at('b').getRenderCount()).toBe(1)
    compoundHookInterface.cleanup()
  })
}
