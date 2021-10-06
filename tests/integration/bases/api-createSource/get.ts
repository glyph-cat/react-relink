import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  test('Source.get()', (): void => {
    const Source = createSource({
      key: 'test/Source.get()',
      default: 1,
    })
    expect(Source.get()).toBe(1)
    Source.cleanup()
  })

}
