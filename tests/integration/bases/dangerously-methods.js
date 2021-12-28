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

  describe('Dangerously Methods', () => {
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

    // Get
    expect(dangerouslyGetRelinkValue(Source)).toBe(1)
    expect(hookInterface.get('value')).toBe('1')

    // Set
    act(() => {
      dangerouslySetRelinkState(Source, 2)
    })
    expect(dangerouslyGetRelinkValue(Source)).toBe(2)
    expect(hookInterface.get('value')).toBe('2')

    // Reset
    act(() => {
      dangerouslyResetRelinkState(Source)
    })
    expect(dangerouslyGetRelinkValue(Source)).toBe(1)
    expect(hookInterface.get('value')).toBe('1')
    // })

    // Rehydrate
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
