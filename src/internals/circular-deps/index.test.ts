import { RelinkSource } from '../../api/source'
import { checkForCircularDeps } from '.'

describe(checkForCircularDeps.name, (): void => {

  let SourceA: RelinkSource<number>
  let SourceB: RelinkSource<number>
  let SourceC: RelinkSource<number>
  afterEach(async () => {
    if (SourceA instanceof RelinkSource) { await SourceA.dispose({ force: true }) }
    if (SourceB instanceof RelinkSource) { await SourceB.dispose({ force: true }) }
    if (SourceC instanceof RelinkSource) { await SourceC.dispose({ force: true }) }
  })

  // KIV: There used to be a problem where `allDepsAreReady` will be called
  // infinitely.
  test('with circular deps', (): void => {
    const callback = (): void => {
      const sourceADeps = []
      SourceA = new RelinkSource({
        key: 'test/source-with-circular-deps/a',
        default: 0,
        deps: sourceADeps,
      })
      SourceB = new RelinkSource({
        key: 'test/source-with-circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      sourceADeps.push(SourceB)
      checkForCircularDeps(SourceA.M$parentDeps, [
        SourceA.M$key,
      ])
    }
    expect(callback).toThrow(
      /test\/source-with-circular-deps\/a -> test\/source-with-circular-deps\/b/
    )
  })

  test('without circular deps', (): void => {
    const callback = (): void => {
      SourceA = new RelinkSource({
        key: 'test/source-without-circular-deps/a',
        default: 0,
        deps: [],
      })
      SourceB = new RelinkSource({
        key: 'test/source-without-circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      SourceC = new RelinkSource({
        key: 'test/source-without-circular-deps/c',
        default: 0,
        deps: [SourceB],
      })
      checkForCircularDeps(SourceC.M$parentDeps, [
        SourceC.M$key,
      ])
    }
    expect(callback).not.toThrow()
  })

})
