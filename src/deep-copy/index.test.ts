import deepCopy from '.'

test('Primitive types', () => {
  let a = 1
  const b = deepCopy(a)
  a = 2
  expect(a).not.toBe(b)
})

test('Arrays', () => {
  const a = [1, 2, 3]
  const b = deepCopy(a)
  const areDifferent = a !== b
  expect(a).toStrictEqual(b)
  expect(areDifferent).toStrictEqual(true)
})

describe('Objects', () => {

  test('Normal values', () => {
    const a = { k1: 1, k2: '2', k3: true }
    const b = deepCopy(a)
    const areDifferent = a !== b
    expect(a).toStrictEqual(b)
    expect(areDifferent).toStrictEqual(true)
  })

  test('Falsey values', () => {
    const a = { k1: undefined, k2: null, k3: NaN, k4: false }
    const b = deepCopy(a)
    const areDifferent = a !== b
    expect(a).toStrictEqual(b)
    expect(areDifferent).toStrictEqual(true)
  })

})

test('Deeply nested', () => {
  const a = {
    k1: [
      {
        id: 1,
        stack: [{ value: 1 }, { value: 2 }, { value: 3 }],
      },
    ],
  }
  const b = deepCopy(a)
  const areDifferent = a !== b
  expect(a).toStrictEqual(b)
  expect(areDifferent).toStrictEqual(true)
})

describe('Other data types', () => {

  test('Date', () => {
    const a = new Date()
    const b = deepCopy(new Date(a))
    const areDifferent = a !== b
    expect(a.toISOString()).toBe(b.toISOString())
    expect(areDifferent).toBe(true)
  })

})
