import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  test('main', (): void => {
    const Source = createSource({
      key: 'test/Source.get()',
      default: 1,
    })
    expect(Source.get()).toBe(1)
    Source.cleanup()
  })

})
