import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: UnitTestConfig): void => {

  const { RelinkSource } = Relink

  test('main', async () => {
    const Source = new RelinkSource({
      key: 'test/Source.get()',
      default: 1,
    })
    expect(Source.get()).toBe(1)
    await Source.dispose()
  })

})
