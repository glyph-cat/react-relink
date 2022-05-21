import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv, buildType }: IntegrationTestConfig): void => {
  test('main', (): void => {
    if (buildEnv === 'debug') {
      expect(Relink.BUILD_TYPE).toBe(undefined)
    } else if (buildType === 'cjs') {
      expect(Relink.BUILD_TYPE).toBe(Relink.RelinkBuildType.CJS)
    } else if (buildType === 'es') {
      if (buildEnv === 'dev') {
        expect(Relink.BUILD_TYPE).toBe(Relink.RelinkBuildType.ES)
      } else if (buildEnv === 'prod') {
        expect(Relink.BUILD_TYPE).toBe(Relink.RelinkBuildType.MJS)
      }
    } else if (buildType === 'umd') {
      if (buildEnv === 'dev') {
        expect(Relink.BUILD_TYPE).toBe(Relink.RelinkBuildType.UMD)
      } else if (buildEnv === 'prod') {
        expect(Relink.BUILD_TYPE).toBe(Relink.RelinkBuildType.UMD_MIN)
      }
    } else {
      throw new Error(`Unexpected condition: ${JSON.stringify({
        buildEnv,
        buildType,
      })}`)
    }
  })
})
