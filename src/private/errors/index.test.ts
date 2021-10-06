import { formatErrorCode } from '.'

describe(formatErrorCode.name, (): void => {

  test('Without args', (): void => {
    const output = formatErrorCode(1)
    expect(output).toBe('Relink_E1')
  })

  test('With args', (): void => {
    const args = ['foo', 42, true, false, null, undefined, Symbol('x')]
    const output = formatErrorCode(1, ...args)
    expect(output).toBe('Relink_E1-foo,42,true,false,null,undefined,Symbol(x)')
  })

})
