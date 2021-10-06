import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink, isDist }: IntegrationTestProps): void {
  test('VERSION', (): void => {
    expect(typeof Relink.VERSION).toBe(isDist ? 'string' : 'undefined')
  })
}
