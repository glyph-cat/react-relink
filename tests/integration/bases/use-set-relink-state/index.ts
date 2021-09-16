import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('useSetRelinkState', (): void => {
    require('./normal').default(testProps)
  })
}
