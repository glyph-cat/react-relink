import { act } from 'react-test-renderer'
import { delay, TIME_GAP } from '../../../debugging-utils'
import { IntegrationTestConfig, ISampleState } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * States are carried forward from one reducer to the next

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  jest.useRealTimers()

  test('Carry forward', async () => {

    const Source = new RelinkSource<ISampleState>({
      key: 'test/x-carry-forward',
      default: {
        foo: 1,
        bar: 1,
      },
    })

    act(() => {
      Source.set((state) => ({ ...state, foo: state.foo + 1 }))
      Source.set(async (state) => ({ ...state, bar: state.bar + 1 }))
      Source.set({ foo: 3, bar: 3 })
      Source.set((state) => ({ ...state, foo: state.foo + 1 }))
      Source.set(async (state) => {
        await delay(TIME_GAP(1))
        return { ...state, bar: state.bar + 1 }
      })
    })

    expect(await Source.getAsync()).toStrictEqual({
      foo: 4,
      bar: 4,
    })

    // Cleanup
    await Source.dispose()

  })

})
