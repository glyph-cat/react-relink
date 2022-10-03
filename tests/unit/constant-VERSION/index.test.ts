import pkg from '../../../package.json'
import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv }: UnitTestConfig): void => {
  test('main', (): void => {
    if (buildEnv === 'debug') {
      expect(Relink.VERSION).toBe(undefined)
    } else {
      expect(Relink.VERSION).toBe(pkg.version)
    }
  })
})
