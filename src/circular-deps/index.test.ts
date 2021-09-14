import { checkForCircularDeps } from '.'

let mockId = 0

function createMockSource({ deps }) {
  return {
    M$deps: deps,
    M$key: ++mockId,
  }
}

describe('checkForCircularDepsAndGetKeyStack', () => {

  test('with circular deps', () => {
    const callback = () => {
      const MockSourceA = createMockSource({ deps: [] })
      const MockSourceB = createMockSource({ deps: [MockSourceA] })
      MockSourceA.M$deps = [MockSourceB]
      checkForCircularDeps(MockSourceA.M$deps, [MockSourceA.M$key])
    }
    expect(callback).toThrow()
  })

  test('without circular deps', () => {
    const callback = () => {
      const MockSourceA = createMockSource({ deps: {} })
      const MockSourceB = createMockSource({ deps: [MockSourceA] })
      const MockSourceC = createMockSource({ deps: [MockSourceB] })
      checkForCircularDeps(MockSourceC.M$deps, [MockSourceC.M$key])
    }
    expect(callback).not.toThrow()
  })

})
