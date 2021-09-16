import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('Setting same values won\'t cause updates', (): void => {
    require('./simple').default(testProps)
    require('./complex').default(testProps)
  })
}
