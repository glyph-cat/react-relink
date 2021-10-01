import { isFunction, isThenable } from '.'

describe(isFunction.name, (): void => {

  test('With a function', (): void => {
    const output = isFunction((): void => { /* */ })
    expect(output).toBe(true)
  })

  test('With a non-function', (): void => {
    const output = isFunction(42)
    expect(output).toBe(false)
  })

  test('With a falsy value', (): void => {
    const output = isFunction(undefined)
    expect(output).toBe(false)
  })

})

describe(isThenable.name, (): void => {

  test('With a normal promise', (): void => {
    // NOTE: Plain promise evaluates to false, it has to be an executed promise.
    const output = isThenable((async (): Promise<void> => { /* */ })())
    expect(output).toBe(true)
  })

  test('With an object with the `then` property as a function', (): void => {
    const output = isThenable({ then: (): void => { /* */ } })
    expect(output).toBe(true)
  })

  test('With an object with the `then` property as a non-function', (): void => {
    const output = isThenable({ then: 42 })
    expect(output).toBe(false)
  })

  test('With a normal function', (): void => {
    const output = isThenable((): void => { /* */ })
    expect(output).toBe(false)
  })

  test('With a non-function', (): void => {
    const output = isThenable(42)
    expect(output).toBe(false)
  })

  test('With a falsy value', (): void => {
    const output = isThenable(undefined)
    expect(output).toBe(false)
  })

})
