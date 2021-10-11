import { RelinkEvent, RelinkEventType, RelinkSource } from '../../../../src/schema'
import { IntegrationTestConfig } from '../../../helpers'
import { wrapper } from '../../wrapper'

// Test objectives:
// * Make sure the `didSet` and `didReset` lifecycle hooks are triggered at
// appropriate times when `.set()`, `.reset()` and `.hydrate()` are called.

let Source: RelinkSource<number> = null
afterEach((): void => {
  Source.cleanup()
})

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  test('main', async (): Promise<void> => {

    const eventStack: Array<RelinkEvent<number>> = []
    Source = createSource({
      key: 'test/',
      default: 0,
      lifecycle: {
        didSet(event) {
          eventStack.push(event)
        },
        didReset(event) {
          eventStack.push(event)
        },
      },
    })

    await Source.hydrate(({ commit }) => { commit(3) })
    await Source.hydrate(({ skip }) => { skip() })
    await Source.set(1)
    await Source.reset()

    expect(eventStack).toStrictEqual([{
      type: RelinkEventType.set,
      state: 1,
    }, {
      type: RelinkEventType.reset,
      state: 0,
    }])

  })

})