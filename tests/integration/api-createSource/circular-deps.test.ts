import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// KIV: There used to be a problem where `allDepsAreReady` will be called
// infinitely.

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource } = Relink

  let SourceA: $RelinkSource<number>
  let SourceB: $RelinkSource<number>
  let SourceC: $RelinkSource<number>
  afterEach((): void => {
    if (SourceA instanceof RelinkSource) { SourceA.cleanup() }
    if (SourceB instanceof RelinkSource) { SourceB.cleanup() }
    if (SourceC instanceof RelinkSource) { SourceC.cleanup() }
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
