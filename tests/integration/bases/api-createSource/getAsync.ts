import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  test('Source.getAsync()', async (): Promise<void> => {
    const Source = createSource({
      key: 'test/Source.getAsync()',
      default: 1,
    })
    expect(await (Source.getAsync())).toBe(1)
    Source.cleanup()
  })

}
