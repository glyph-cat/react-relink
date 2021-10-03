import { IntegrationTestProps } from '../../../helpers'

// TODO: Test with complex data
// TODO: Test with [,,reset]

export default function (testProps: IntegrationTestProps): void {
  describe('useRelinkState', (): void => {
    require('./use-relink-state').default(testProps)
    require('./use-relink-state-s').default(testProps)
    require('./use-relink-state-s,r').default(testProps)
    require('./use-relink-state-s,r,d').default(testProps)
  })
}
