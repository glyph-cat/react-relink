import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource } = Relink

  test('main', async () => {
    const Source = new RelinkSource({
      key: 'test/Source.getAsync()',
      default: 1,
    })
    expect(await (Source.getAsync())).toBe(1)
    await Source.dispose()
  })

})
