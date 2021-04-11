import { act } from 'react-test-renderer'
import { createHookInterface } from '../../__utils__/hook-interface'

export default function ({ Relink }) {

  const {
    createSource,
    dangerouslyGetRelinkValue,
    dangerouslySetRelinkState,
    dangerouslyResetRelinkState,
    dangerouslyRehydrateRelinkSource,
    useRelinkValue,
  } = Relink

  it('Dangerously Methods', () => {
    // Create source
    const Source = createSource({
      default: 1,
    })

    const hookInterface = createHookInterface({
      hook: {
        method: useRelinkValue,
        props: [Source],
      },
      values: {
        value: (H) => H, // No longer need `[value]` because is `useRelinkValue`
      },
    })

    // Test get
    expect(dangerouslyGetRelinkValue(Source)).toBe(1)
    expect(hookInterface.get('value')).toBe('1')

    // Test set & get
    act(() => {
      dangerouslySetRelinkState(Source, 2)
    })
    expect(dangerouslyGetRelinkValue(Source)).toBe(2)
    expect(hookInterface.get('value')).toBe('2')

    // Test reset & get
    act(() => {
      dangerouslyResetRelinkState(Source)
    })
    expect(dangerouslyGetRelinkValue(Source)).toBe(1)
    expect(hookInterface.get('value')).toBe('1')

    // Test rehydrate
    act(() => {
      dangerouslyRehydrateRelinkSource(Source, ({ commit }) => {
        commit(5)
      })
    })
    expect(dangerouslyGetRelinkValue(Source)).toBe(5)
    expect(hookInterface.get('value')).toBe('5')

    hookInterface.cleanup()
  })
}
