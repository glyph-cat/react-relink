import { act } from 'react-test-renderer'
import { createCompoundHookInterface } from '../../__utils__/hook-interface'

const timeInterval = 1000 // ms

export default function ({ Relink }) {
  describe('deps', () => {
    it('Synchronous', () => {
      jest.useFakeTimers()

      const SourceA = Relink.createSource({
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

      const SourceB = Relink.createSource({
        key: 'Source B',
        default: 0,
        deps: { SourceA },
        lifecycle: {
          init: ({ commit }) => {
            setTimeout(() => {
              const sourceAValue = Relink.dangerouslyGetRelinkValue(SourceA)
              commit(sourceAValue + 1)
            }, timeInterval)
          },
        },
      })

      const SourceC = Relink.createSource({
        key: 'Source C',
        default: 0,
        deps: { SourceB },
        lifecycle: {
          init: ({ commit }) => {
            const sourceBValue = Relink.dangerouslyGetRelinkValue(SourceB)
            commit(sourceBValue + 1)
          },
        },
      })

      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: Relink.useRelinkValue,
            props: [SourceA],
          },
          values: {
            value: (H) => H,
          },
        },
        b: {
          hook: {
            method: Relink.useRelinkValue,
            props: [SourceB],
          },
          values: {
            value: (H) => H,
          },
        },
        c: {
          hook: {
            method: Relink.useRelinkValue,
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
