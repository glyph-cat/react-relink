import { act } from 'react-test-renderer'
import { delay, TIME_GAP } from '../../../src/debugging'
import { IntegrationTestConfig, SampleSchema } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * States are carried forward from one reducer to the next

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource } = Relink

  test('Carry forward', async (): Promise<void> => {

    const Source = new RelinkSource<SampleSchema>({
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
    Source.cleanup()

  })

})
