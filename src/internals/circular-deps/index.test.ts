import { SOURCE_INTERNAL_SYMBOL } from '../../constants'
import { createSource, isRelinkSource } from '../../api/source'
import { RelinkSourceSchema } from '../../schema'
import { checkForCircularDeps } from '.'

describe(checkForCircularDeps.name, (): void => {

  let SourceA: RelinkSourceSchema<number>
  let SourceB: RelinkSourceSchema<number>
  let SourceC: RelinkSourceSchema<number>
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
      checkForCircularDeps(SourceA[SOURCE_INTERNAL_SYMBOL].M$parentDeps, [
        SourceA[SOURCE_INTERNAL_SYMBOL].M$key,
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
      checkForCircularDeps(SourceC[SOURCE_INTERNAL_SYMBOL].M$parentDeps, [
        SourceC[SOURCE_INTERNAL_SYMBOL].M$key,
      ])
    }
    expect(callback).not.toThrow()
  })

})
