import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// KIV: There used to be a problem where `allDepsAreReady` will be called
// infinitely.

wrapper(({ Relink }: UnitTestConfig): void => {

  const { RelinkSource } = Relink

  let SourceA: $RelinkSource<number>
  let SourceB: $RelinkSource<number>
  let SourceC: $RelinkSource<number>
  afterEach(async () => {
    if (SourceA instanceof RelinkSource) { await SourceA.dispose({ force: true }) }
    if (SourceB instanceof RelinkSource) { await SourceB.dispose({ force: true }) }
    if (SourceC instanceof RelinkSource) { await SourceC.dispose({ force: true }) }
  })

  test('main', (): void => {
    const callback = (): void => {
      const sourceADeps = []
      SourceA = new RelinkSource({
        key: 'test/RelinkSource/circular-deps/a',
        default: 0,
        deps: sourceADeps,
      })
      SourceB = new RelinkSource({
        key: 'test/RelinkSource/circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      sourceADeps.push(SourceB)
      SourceC = new RelinkSource({
        key: 'test/RelinkSource/circular-deps/c',
        default: 0,
        deps: [SourceB],
      })
    }
    expect(callback).toThrow(
      /test\/RelinkSource\/circular-deps\/c -> test\/RelinkSource\/circular-deps\/b -> test\/RelinkSource\/circular-deps\/a -> test\/RelinkSource\/circular-deps\/b/
    )
  })

})
