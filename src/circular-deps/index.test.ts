import { INTERNALS_SYMBOL } from '../constants'
import { checkForCircularDeps } from '.'

// NOTE: We need to use mock sources so that we can modify the deps.
let mockId = 0
function createMockSource({ deps }) {
  return {
    [INTERNALS_SYMBOL]: {
      M$deps: deps,
      M$key: `test/mock-source/${++mockId}`,
    },
  }
}

describe(checkForCircularDeps.name, () => {

  test('with circular deps', () => {
    const callback = () => {
      const MockSourceA = createMockSource({ deps: [] })
      const MockSourceB = createMockSource({ deps: [MockSourceA] })
      MockSourceA[INTERNALS_SYMBOL].M$deps = [MockSourceB]
      checkForCircularDeps(MockSourceA[INTERNALS_SYMBOL].M$deps, [
        MockSourceA[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).toThrow()
  })

  test('without circular deps', () => {
    const callback = () => {
      const MockSourceA = createMockSource({ deps: [] })
      const MockSourceB = createMockSource({ deps: [MockSourceA] })
      const MockSourceC = createMockSource({ deps: [MockSourceB] })
      checkForCircularDeps(MockSourceC[INTERNALS_SYMBOL].M$deps, [
        MockSourceC[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).not.toThrow()
  })

})
