import pkg from '../../../package.json'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv }: IntegrationTestConfig): void => {
  test('main', (): void => {
    if (buildEnv === 'debug') {
      expect(Relink.VERSION).toBe(undefined)
    } else {
      expect(Relink.VERSION).toBe(pkg.version)
    }
  })
})
