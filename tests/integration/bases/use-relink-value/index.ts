import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('useRelinkValue', (): void => {
    require('./normal').default(testProps)
    require('./with-selector').default(testProps)
  })
}
