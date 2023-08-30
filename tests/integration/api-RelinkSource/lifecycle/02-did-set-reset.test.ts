import {
  RelinkEvent,
  RelinkSource as $RelinkSource,
} from '../../../../src/bundle'
import { IntegrationTestConfig } from '../../../helpers'
import { wrapper } from '../../wrapper'

// Test objectives:
// * Make sure the `didSet` and `didReset` lifecycle hooks are triggered at
// appropriate times when `.set()`, `.reset()` and `.hydrate()` are called.

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource, RelinkEventType } = Relink

  let Source: $RelinkSource<number> = null
  afterEach(async () => {
    await Source.dispose()
    Source = null
  })

  test('main', async () => {

    const eventStack: Array<RelinkEvent<number>> = []
    Source = new RelinkSource({
      key: 'test/RelinkSource/lifecycle/did-set-reset',
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
    await Source.hydrate(({ commitNoop }) => { commitNoop() })
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
