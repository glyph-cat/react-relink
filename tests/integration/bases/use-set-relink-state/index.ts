import { IntegrationTestProps } from '../../constants'

export default function (testProps: IntegrationTestProps): void {
  describe('useSetRelinkState', () => {
    require('./normal').default(testProps)
  })
}
