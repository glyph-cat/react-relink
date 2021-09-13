import { IntegrationTestProps } from '../../constants'

export default function (testProps: IntegrationTestProps): void {
  describe('useRelinkValue', () => {
    require('./normal').default(testProps)
    require('./with-selector').default(testProps)
  })
}
