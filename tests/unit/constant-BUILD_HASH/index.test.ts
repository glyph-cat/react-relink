import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv }: UnitTestConfig): void => {
  test('main', (): void => {
    if (buildEnv === 'debug') {
      expect(Relink.BUILD_HASH).toBe(undefined)
    } else {
      expect(Relink.BUILD_HASH).toMatch(/^[a-f0-9]{40}$/)
    }
  })
})
