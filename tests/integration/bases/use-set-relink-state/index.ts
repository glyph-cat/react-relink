import { IntegrationTestProps } from '../../../helpers'

export default function (testProps: IntegrationTestProps): void {
  const { Relink: { useSetRelinkState } } = testProps
  describe(useSetRelinkState.name, () => {
    require('./normal').default(testProps)
  })
}
