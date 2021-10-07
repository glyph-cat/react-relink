import { RelinkSource } from '../../../src'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, isRelinkSource } = Relink

  let SourceA: RelinkSource<number>
  let SourceB: RelinkSource<number>
  let SourceC: RelinkSource<number>
  afterEach((): void => {
    if (isRelinkSource(SourceA)) { SourceA.cleanup() }
    if (isRelinkSource(SourceB)) { SourceB.cleanup() }
    if (isRelinkSource(SourceC)) { SourceC.cleanup() }
  })

  test.skip('main', (): void => {
    const callback = (): void => {
      const sourceADeps = []
      SourceA = createSource({
        key: 'test/createSource/circular-deps/a',
        default: 0,
        deps: sourceADeps,
      })
      SourceB = createSource({
        key: 'test/createSource/circular-deps/b',
        default: 0,
        deps: [SourceA],
      })
      sourceADeps.push(SourceB)
      SourceC = createSource({
        key: 'test/createSource/circular-deps/c',
        default: 0,
        deps: [SourceB],
      })
    }
    expect(callback).toThrow() // TODO: Check error message
  })

})
