import { INTERNALS_SYMBOL } from '../../constants'
import { createSource } from '..'
import { checkForCircularDeps } from '.'

describe(checkForCircularDeps.name, (): void => {

  test('with circular deps', (): void => {
    const callback = (): void => {
      const MockSourceA = createSource({
        key: 'test/mock-source/w-cdeps/a',
        default: 0,
        deps: [],
      })
      const MockSourceB = createSource({
        key: 'test/mock-source/w-cdeps/b',
        default: 0,
        deps: [MockSourceA],
      })
      // Tamper with the source to create circular dependency. I have no idea
      // how circular dependencies would be possible in a normal use case, but
      // still, this check is added as a safeguard.
      MockSourceA[INTERNALS_SYMBOL].M$parentDeps = [MockSourceB]
      checkForCircularDeps(MockSourceA[INTERNALS_SYMBOL].M$parentDeps, [
        MockSourceA[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).toThrow()
  })

  test('without circular deps', (): void => {
    const callback = (): void => {
      const MockSourceA = createSource({
        key: 'test/mock-source/wo-cdeps/a',
        default: 0,
        deps: [],
      })
      const MockSourceB = createSource({
        key: 'test/mock-source/wo-cdeps/b',
        default: 0,
        deps: [MockSourceA],
      })
      const MockSourceC = createSource({
        key: 'test/mock-source/wo-cdeps/c',
        default: 0,
        deps: [MockSourceB],
      })
      checkForCircularDeps(MockSourceC[INTERNALS_SYMBOL].M$parentDeps, [
        MockSourceC[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).not.toThrow()
  })

})
