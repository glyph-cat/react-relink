import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('createSource', (): void => {
    require('./get').default(testProps)
    require('./getAsync').default(testProps)
    require('./hydrate').default(testProps)
    require('./key-validity').default(testProps)
    require('./reset').default(testProps)
    require('./set').default(testProps)
    require('./circular-deps').default(testProps)
  })
}
