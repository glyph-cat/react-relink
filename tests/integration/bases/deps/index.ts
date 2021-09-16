import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { act } from 'react-test-renderer'
import { IntegrationTestProps, TIME_GAP } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, useRelinkValue } = Relink

  test('Deps', (): void => {
    jest.useFakeTimers()

    const SourceA = createSource({
      key: 'test/deps/SourceA',
      default: 0,
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            commit(2)
          }, TIME_GAP(1))
        },
      },
      options: {
        virtualBatch: true,
      },
    })

    const SourceB = createSource({
      key: 'test/deps/SourceB',
      default: 0,
      deps: [SourceA],
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            const sourceAValue = SourceA.get()
            commit(sourceAValue + 1)
          }, TIME_GAP(1))
        },
      },
      options: {
        virtualBatch: true,
      },
    })

    const SourceC = createSource({
      key: 'test/deps/SourceC',
      default: 0,
      deps: [SourceB],
      lifecycle: {
        init: ({ commit }): void => {
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

    // expect(SourceA.get()).toBe(0)
    // expect(SourceB.get()).toBe(0)
    // expect(SourceC.get()).toBe(0)
    expect(hookInterfaceA.get('value')).toBe(0)
    expect(hookInterfaceB.get('value')).toBe(0)
    expect(hookInterfaceC.get('value')).toBe(0)

    act(() => {
      jest.advanceTimersByTime(TIME_GAP(2))
    })

    // expect(SourceA.get()).toBe(2)
    // expect(SourceB.get()).toBe(0)
    // expect(SourceC.get()).toBe(0)
    expect(hookInterfaceA.get('value')).toBe(2)
    expect(hookInterfaceB.get('value')).toBe(0)
    expect(hookInterfaceC.get('value')).toBe(0)

    act(() => {
      jest.advanceTimersByTime(TIME_GAP(2))
    })

    // expect(SourceA.get()).toBe(2)
    // expect(SourceB.get()).toBe(3)
    // expect(SourceC.get()).toBe(4)
    expect(hookInterfaceA.get('value')).toBe(2)
    expect(hookInterfaceB.get('value')).toBe(3)
    expect(hookInterfaceC.get('value')).toBe(4)

    // Cleanup
    SourceA.UNSTABLE_cleanup()
    SourceB.UNSTABLE_cleanup()
    SourceC.UNSTABLE_cleanup()

  })

}
