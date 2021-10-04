import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  describe('Source', (): void => {
    require('./basics').default(testProps)
    require('./hydrate-persist').default(testProps)
    require('./rehydration').default(testProps)
  })
}
