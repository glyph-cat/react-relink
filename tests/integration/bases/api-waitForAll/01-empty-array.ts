import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { waitForAll } = Relink

  test('Empty array', async (): Promise<void> => {
    const promise = await waitForAll([])
    expect(promise).toBe(undefined)
  })

}
