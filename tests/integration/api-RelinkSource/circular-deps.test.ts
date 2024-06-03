import type { RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  let SourceA: RelinkSource<number> = null
  let SourceB: RelinkSource<number> = null
  let SourceC: RelinkSource<number> = null
  afterEach(async () => {
    if (SourceA instanceof RelinkSource) {
      await SourceA.dispose({ force: true })
      SourceA = null
    }
    if (SourceB instanceof RelinkSource) {
      await SourceB.dispose({ force: true })
      SourceB = null
    }
    if (SourceC instanceof RelinkSource) {
      await SourceC.dispose({ force: true })
      SourceC = null
    }
  })

  test('main', () => {
    const callback = () => {
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
