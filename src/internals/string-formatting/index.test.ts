import {
  formatFunctionNotation,
  formatFunctionNotationArray,
  safeStringJoin,
} from '.'

test(formatFunctionNotation.name, () => {
  const output = formatFunctionNotation('foo')
  expect(output).toBe('`foo()`')
})

test(formatFunctionNotationArray.name, () => {
  const output = formatFunctionNotationArray(['foo', 'bar', 'baz'])
  expect(output).toBe('`foo()`, `bar()`, `baz()`')
})

test(safeStringJoin.name, () => {
  const args = ['foo', 42, true, false, null, undefined]
  expect(args.join(',')).toBe('foo,42,true,false,,')
  const argsWithSymbol = [...args, Symbol('x')]
  expect(safeStringJoin(argsWithSymbol, ',')).toBe(
    'foo,42,true,false,null,undefined,Symbol(x)'
  )
})



