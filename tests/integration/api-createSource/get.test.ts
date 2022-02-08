import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource } = Relink

  test('main', (): void => {
    const Source = new RelinkSource({
      key: 'test/Source.get()',
      default: 1,
    })
    expect(Source.get()).toBe(1)
    Source.cleanup()
  })

})
