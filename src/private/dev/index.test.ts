import {
  formatFunctionNotation,
  formatFunctionNotationArray,
} from '.'

test(formatFunctionNotation.name, (): void => {
  const output = formatFunctionNotation('foo')
  expect(output).toBe('`foo()`')
})

test(formatFunctionNotationArray.name, (): void => {
  const output = formatFunctionNotationArray(['foo', 'bar', 'baz'])
  expect(output).toBe('`foo()`, `bar()`, `baz()`')
})
