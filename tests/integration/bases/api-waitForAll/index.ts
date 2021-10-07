import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('waitForAll', (): void => {
    require('./01-empty-array').default(testProps)
    // require('./02-no-deps').default(testProps)
    require('./03-some-with-deps').default(testProps)
    // require('./04-all-with-deps').default(testProps)
    // require('./05-all-with-deep-deps').default(testProps)
  })
}
