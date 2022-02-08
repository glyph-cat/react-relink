import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, isRelinkSource } = Relink

  test('With Relink Source', (): void => {
    const output = isRelinkSource(new RelinkSource({
      key: 'isRelinkSource/true',
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
