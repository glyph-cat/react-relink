import { IntegrationTestProps } from '../../constants'

export default function (testProps: IntegrationTestProps): void {
  describe('Source', () => {
    require('./basics').default(testProps)
    require('./hydrate-persist').default(testProps)
    require('./mutability').default(testProps)
    require('./rehydration').default(testProps)
  })
}
