import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { act } from 'react-test-renderer'
import { IntegrationTestProps } from '../../constants'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

const timeInterval = 1000 // ms

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, useRelinkValue } = Relink

  test('Deps', () => {
    jest.useFakeTimers()

    const SourceA = createSource({
      key: 'test/deps/SourceA',
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
      key: 'test/deps/SourceB',
      default: 0,
      deps: [SourceA],
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
      key: 'test/deps/SourceC',
      default: 0,
      deps: [SourceB],
      lifecycle: {
        init: ({ commit }) => {
          const sourceBValue = SourceB.get()
          commit(sourceBValue + 1)
        },
      },
    })

    const hookInterfaceA = createHookInterface({
      useHook: () => useRelinkValue(SourceA),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    const hookInterfaceB = createHookInterface({
      useHook: () => useRelinkValue(SourceB),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    const hookInterfaceC = createHookInterface({
      useHook: () => useRelinkValue(SourceC),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)

    expect(hookInterfaceA.get('value')).toBe(0)
    expect(hookInterfaceB.get('value')).toBe(0)
    expect(hookInterfaceC.get('value')).toBe(0)

    act(() => {
      jest.advanceTimersByTime(timeInterval)
    })

    expect(hookInterfaceA.get('value')).toBe(2)
    expect(hookInterfaceB.get('value')).toBe(0)
    expect(hookInterfaceC.get('value')).toBe(0)

    act(() => {
      jest.advanceTimersByTime(timeInterval)
    })

    expect(hookInterfaceA.get('value')).toBe(2)
    expect(hookInterfaceB.get('value')).toBe(3)
    expect(hookInterfaceC.get('value')).toBe(4)

    // Cleanup
    SourceA.UNSTABLE_cleanup()
    SourceB.UNSTABLE_cleanup()
    SourceC.UNSTABLE_cleanup()

  })

}
