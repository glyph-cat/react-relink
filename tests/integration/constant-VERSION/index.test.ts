import { version as PKG_VERSION } from '../../../package.json'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv }: IntegrationTestConfig) => {
  test('main', () => {
    if (buildEnv === 'debug') {
      expect(Relink.VERSION).toBe(undefined)
    } else {
      expect(Relink.VERSION).toBe(PKG_VERSION)
    }
  })
})
