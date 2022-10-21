import { isFunction, isObject, isThenable } from '.'

describe(isFunction.name, () => {

  test('With a function', () => {
    const output = isFunction(() => { /* */ })
    expect(output).toBe(true)
  })

  test('With a non-function', () => {
    const output = isFunction(42)
    expect(output).toBe(false)
  })

  test('With a falsy value', () => {
    const output = isFunction(undefined)
    expect(output).toBe(false)
  })

})

describe(isObject.name, () => {

  test('Plain object', () => {
    const output = isObject({ hello: 'world' })
    expect(output).toBe(true)
  })

  test('Class instance', () => {
    const output = isObject(new Date())
    expect(output).toBe(true)
  })

  test('Something else', () => {
    const output = isObject(42)
    expect(output).toBe(false)
  })

})

describe(isThenable.name, () => {

  test('With a normal promise', () => {
    // NOTE: Plain promise evaluates to false, it has to be an executed promise.
    const output = isThenable((async () => { /* */ })())
    expect(output).toBe(true)
  })

  test('With an object with the `then` property as a function', () => {
    const output = isThenable({ then: () => { /* */ } })
    expect(output).toBe(true)
  })

  test('With an object with the `then` property as a non-function', () => {
    const output = isThenable({ then: 42 })
    expect(output).toBe(false)
  })

  test('With a normal function', () => {
    const output = isThenable(() => { /* */ })
    expect(output).toBe(false)
  })

  test('With a non-function', () => {
    const output = isThenable(42)
    expect(output).toBe(false)
  })

  test('With a falsy value', () => {
    const output = isThenable(undefined)
    expect(output).toBe(false)
  })

})
