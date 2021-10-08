import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  test('main', async (): Promise<void> => {
    const Source = createSource({
      key: 'test/Source.getAsync()',
      default: 1,
    })
    expect(await (Source.getAsync())).toBe(1)
    Source.cleanup()
  })

})
