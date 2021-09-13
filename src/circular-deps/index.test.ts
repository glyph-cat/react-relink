import { checkForCircularDepsAndGetKeyStack } from '.'

let mockId = 0
function createMockSource({ deps }) {
  return {
    M$internalId: ++mockId,
    M$deps: deps,
  }
}

describe('checkForCircularDepsAndGetKeyStack', () => {

  test('with circular deps', () => {
    const callback = () => {
      const MockSourceA = createMockSource({
        deps: {},
      })
      const MockSourceB = createMockSource({
        deps: { MockSourceA },
      })
      MockSourceA.M$deps = { MockSourceB }
      checkForCircularDepsAndGetKeyStack(
        MockSourceA.M$internalId,
        MockSourceA.M$deps
      )
    }
    expect(callback).toThrow()
  })

  test('without circular deps', () => {
    const callback = () => {
      const MockSourceA = createMockSource({
        deps: {},
      })
      const MockSourceB = createMockSource({
        deps: { MockSourceA },
      })
      const MockSourceC = createMockSource({
        deps: { MockSourceB },
      })
      checkForCircularDepsAndGetKeyStack(
        MockSourceC.M$internalId,
        MockSourceC.M$deps
      )
    }
    expect(callback).not.toThrow()
  })

})
