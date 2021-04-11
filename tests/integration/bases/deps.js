import { act } from 'react-test-renderer'
import { createCompoundHookInterface } from '../../__utils__/hook-interface'

const timeInterval = 1000 // ms

export default function ({ Relink }) {
  const { createSource, useRelinkValue } = Relink
  describe('deps', () => {
    it('Synchronous', () => {
      jest.useFakeTimers()

      const SourceA = createSource({
        key: 'Source A',
        default: 0,
        lifecycle: {
          init: ({ commit }) => {
            setTimeout(() => {
              commit(2)
            }, timeInterval)
          },
        },
      })

      const SourceB = createSource({
        key: 'Source B',
        default: 0,
        deps: { SourceA },
        lifecycle: {
          init: ({ commit }) => {
            setTimeout(() => {
              const sourceAValue = SourceA.get()
              commit(sourceAValue + 1)
            }, timeInterval)
          },
        },
      })

      const SourceC = createSource({
        key: 'Source C',
        default: 0,
        deps: { SourceB },
        lifecycle: {
          init: ({ commit }) => {
            const sourceBValue = SourceB.get()
            commit(sourceBValue + 1)
          },
        },
      })

      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: useRelinkValue,
            props: [SourceA],
          },
          values: {
            value: (H) => H,
          },
        },
        b: {
          hook: {
            method: useRelinkValue,
            props: [SourceB],
          },
          values: {
            value: (H) => H,
          },
        },
        c: {
          hook: {
            method: useRelinkValue,
            props: [SourceC],
          },
          values: {
            value: (H) => H,
          },
        },
      })

      expect(compoundHookInterface.at('a').get('value')).toBe('0')
      expect(compoundHookInterface.at('b').get('value')).toBe('0')
      expect(compoundHookInterface.at('c').get('value')).toBe('0')

      act(() => {
        jest.advanceTimersByTime(timeInterval)
      })

      expect(compoundHookInterface.at('a').get('value')).toBe('2')
      expect(compoundHookInterface.at('b').get('value')).toBe('0')
      expect(compoundHookInterface.at('c').get('value')).toBe('0')

      act(() => {
        jest.advanceTimersByTime(timeInterval)
      })

      expect(compoundHookInterface.at('a').get('value')).toBe('2')
      expect(compoundHookInterface.at('b').get('value')).toBe('3')
      expect(compoundHookInterface.at('c').get('value')).toBe('4')

      compoundHookInterface.cleanup()
    })
  })
}
