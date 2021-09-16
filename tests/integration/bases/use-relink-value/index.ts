import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  const { Relink: { useRelinkValue } } = testProps
  describe(useRelinkValue.name, () => {
    require('./normal').default(testProps)
    require('./with-selector').default(testProps)
  })
}
