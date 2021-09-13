import { IntegrationTestProps } from '../../constants'

// TODO: Test with complex data

export default function (testProps: IntegrationTestProps): void {
  describe('useRelinkState', () => {
    require('./use-relink-state').default(testProps)
    require('./use-relink-state-s').default(testProps)
    require('./use-relink-state-s,r').default(testProps)
    require('./use-relink-state-s,r,d').default(testProps)
  })
}
