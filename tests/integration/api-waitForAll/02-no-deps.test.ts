import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, waitForAll } = Relink
  const testName = 'waitForAll'

  test('main', async (): Promise<void> => {

    const SourceA = createSource({
      key: `test/${testName}/no-deps/a`,
      default: null,
    })
    const SourceB = createSource({
      key: `test/${testName}/no-deps/b`,
      default: null,
    })
    const SourceC = createSource({
      key: `test/${testName}/no-deps/c`,
      default: null,
    })

    const promise = await waitForAll([SourceA, SourceB, SourceC])
    expect(promise).toBe(undefined)

    // Cleanup
    SourceA.cleanup()
    SourceB.cleanup()
    SourceC.cleanup()

  })

})
