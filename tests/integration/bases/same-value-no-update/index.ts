import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('Setting same values won\'t cause updates', () => {
    require('./simple').default(testProps)
    require('./complex').default(testProps)
  })
}
