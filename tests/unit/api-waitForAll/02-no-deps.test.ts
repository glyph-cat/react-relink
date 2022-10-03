import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: UnitTestConfig): void => {

  const { RelinkSource, waitForAll } = Relink
  const testName = 'waitForAll'

  test('main', async () => {

    const SourceA = new RelinkSource({
      key: `test/${testName}/no-deps/a`,
      default: null,
    })
    const SourceB = new RelinkSource({
      key: `test/${testName}/no-deps/b`,
      default: null,
    })
    const SourceC = new RelinkSource({
      key: `test/${testName}/no-deps/c`,
      default: null,
    })

    const promise = await waitForAll([SourceA, SourceB, SourceC])
    expect(promise).toBe(undefined)

    // Cleanup
    await SourceA.dispose()
    await SourceB.dispose()
    await SourceC.dispose()

  })

})
