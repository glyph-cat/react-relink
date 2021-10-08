test.skip('Not ready', (): void => { expect('').toBe('') })


// Test if states are carried forward by including a mix of complete overrides and reducers

import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink
  const testDescriptoin = 'States are carried forward from one reducer to the next'

  test(testDescriptoin, async (): Promise<void> => {

    const Source = createSource({
      key: 'test/x-carry-forward',
      default: {
        // ...
      },
    })

    // Perform many sets, resets, and hydrates
    // In the middle use get to check on the state at that point
    // Then at last use getAsync to check if state is correct

  })

}
