import { IntegrationTestProps } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource, isRelinkSource } = Relink

  const testName = 'isRelinkSource'

  describe(testName, (): void => {

    test('With Relink Source', (): void => {
      const output = isRelinkSource(createSource({
        key: `${testName}/true`,
        default: null,
      }))
      expect(output).toBe(true)
    })

    const otherDataTypes = [
      { name: 'number', value: 42 },
      { name: 'boolean (true)', value: true },
      { name: 'boolean (false)', value: false },
      { name: 'object', value: {} },
      { name: 'array', value: [] },
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
      { name: 'date', value: new Date() },
    ]

    for (const otherDataType of otherDataTypes) {
      test(`With other data type: ${otherDataType.name}`, (): void => {
        const output = isRelinkSource(otherDataType.value)
        expect(output).toBe(false)
      })
    }

  })

}
