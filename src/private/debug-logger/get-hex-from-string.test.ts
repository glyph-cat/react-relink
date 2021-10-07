import { getHexFromString } from './get-hex-from-string'

test(getHexFromString.name, (): void => {

  const output1 = getHexFromString('hello world')
  expect(output1).toMatch(/^#[0123456789ABCDEF]{6}$/i)

  const output2 = getHexFromString('hello world')
  expect(output1 === output2).toBe(true)

  const output3 = getHexFromString('hello_world')
  expect(output1 === output3).toBe(false)

})
