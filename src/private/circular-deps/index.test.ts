import { INTERNALS_SYMBOL } from '../../constants'
import { isRelinkSource } from '../../public/is-relink-source'
import { createSource } from '../../public/source'
import { RelinkSource } from '../../schema'
import { checkForCircularDeps } from '.'

describe(checkForCircularDeps.name, (): void => {

  let SourceA: RelinkSource<number>
  let SourceB: RelinkSource<number>
  let SourceC: RelinkSource<number>
  afterEach((): void => {
    if (isRelinkSource(SourceA)) { SourceA.cleanup() }
    if (isRelinkSource(SourceB)) { SourceB.cleanup() }
    if (isRelinkSource(SourceC)) { SourceC.cleanup() }
  })

  // KIV: There used to be a problem where `allDepsAreReady` will be called
  // infinitely.
  test('with circular deps', (): void => {
    const callback = (): void => {
      const sourceADeps = []
      SourceA = createSource({
        key: 'test/source-with-circular-deps/a',
        default: 0,
        deps: sourceADeps,
      })
      SourceB = createSource({
        key: 'test/source-with-circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      sourceADeps.push(SourceB)
      checkForCircularDeps(SourceA[INTERNALS_SYMBOL].M$parentDeps, [
        SourceA[INTERNALS_SYMBOL].M$key,
      ])
    }
    expect(callback).toThrow(
      /test\/source-with-circular-deps\/a -> test\/source-with-circular-deps\/b/
    )
  })

  test('without circular deps', (): void => {
    const callback = (): void => {
      SourceA = createSource({
        key: 'test/source-without-circular-deps/a',
        default: 0,
        deps: [],
      })
      SourceB = createSource({
        key: 'test/source-without-circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      SourceC = createSource({
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
