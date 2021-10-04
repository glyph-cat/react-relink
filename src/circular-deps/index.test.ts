import { INTERNALS_SYMBOL } from '../constants'
import { createSource } from '..'
import { checkForCircularDeps } from '.'

describe(checkForCircularDeps.name, (): void => {

  test('with circular deps', (): void => {
    const callback = (): void => {
      const sourceADeps = []
      const SourceA = createSource({
        key: 'test/source-with-circular-deps/a',
        default: 0,
        deps: sourceADeps,
      })
      const SourceB = createSource({
        key: 'test/source-with-circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      sourceADeps.push(SourceB)
      checkForCircularDeps(SourceA[INTERNALS_SYMBOL].M$parentDeps, [
        SourceA[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).toThrow()
  })

  test('without circular deps', (): void => {
    const callback = (): void => {
      const SourceA = createSource({
        key: 'test/source-without-circular-deps/a',
        default: 0,
        deps: [],
      })
      const SourceB = createSource({
        key: 'test/source-without-circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      const SourceC = createSource({
        key: 'test/source-without-circular-deps/c',
        default: 0,
        deps: [SourceB],
      })
      checkForCircularDeps(SourceC[INTERNALS_SYMBOL].M$parentDeps, [
        SourceC[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).not.toThrow()
  })

})
