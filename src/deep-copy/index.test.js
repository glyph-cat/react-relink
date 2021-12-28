import deepCopy from '.'

it('Primitive types', () => {
  let a = 1
  let b = deepCopy(a)
  a = 2
  expect(a).not.toBe(b)
})

it('Arrays', () => {
  let a = [1, 2, 3]
  let b = deepCopy(a)
  const areDifferent = a !== b
  expect(a).toStrictEqual(b)
  expect(areDifferent).toStrictEqual(true)
})

describe('Objects', () => {
  it('Normal values', () => {
    let a = { k1: 1, k2: '2', k3: true }
    let b = deepCopy(a)
    const areDifferent = a !== b
    expect(a).toStrictEqual(b)
    expect(areDifferent).toStrictEqual(true)
  })
  it('Falsey values', () => {
    let a = { k1: undefined, k2: null, k3: NaN, k4: false }
    let b = deepCopy(a)
    const areDifferent = a !== b
    expect(a).toStrictEqual(b)
    expect(areDifferent).toStrictEqual(true)
  })
})

it('Deeply nested', () => {
  let a = {
    k1: [
      {
        id: 1,
        stack: [{ value: 1 }, { value: 2 }, { value: 3 }],
      },
    ],
  }
  let b = deepCopy(a)
  const areDifferent = a !== b
  expect(a).toStrictEqual(b)
  expect(areDifferent).toStrictEqual(true)
})

describe('Other data types', () => {
  it('Date', () => {
    const a = new Date()
    const b = deepCopy(a, [])
    const areDifferent = a !== b
    expect(a.toISOString()).toBe(b.toISOString())
    expect(areDifferent).toBe(true)
  })
})
