import {
  RELINK_COMPARE_FN_PRESET,
  resetShallowCompareInvocationSpy,
  SHALLOW_COMPARE_INVOCATION_SPY,
  SHALLOW_COMPARE_INVOCATION_TYPE,
} from '.'

const {
  shallowCompareArray,
  shallowCompareArrayOrObject,
  shallowCompareObject,
  stringifyCompare
} = RELINK_COMPARE_FN_PRESET

afterEach(resetShallowCompareInvocationSpy)

describe(shallowCompareArray.name, (): void => {


  test('Empty array', (): void => {
    const isEqual = shallowCompareArray([], [])
    expect(isEqual).toBe(true)
  })

  describe('Different types', (): void => {

    test('undefined, []', (): void => {
      const isEqual = shallowCompareArray(undefined, [])
      expect(isEqual).toBe(false)
    })

    test('number, []', (): void => {
      const isEqual = shallowCompareArray(42, [])
      expect(isEqual).toBe(false)
    })

  })

  test('Differrent length', (): void => {
    const prevState = ['foo', 42]
    const nextState = ['foo', 'bar', 42]
    const isEqual = shallowCompareArray(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same length, different items', (): void => {
    const prevState = ['foo', {}, 42]
    const nextState = ['foo', {}, 42]
    const isEqual = shallowCompareArray(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same length, same items', (): void => {
    const OBJ = {}
    const prevState = ['foo', OBJ, 42]
    const nextState = ['foo', OBJ, 42]
    const isEqual = shallowCompareArray(prevState, nextState)
    expect(isEqual).toBe(true)
  })

})

describe(shallowCompareArrayOrObject.name, (): void => {

  test('[], []', (): void => {
    const isEqual = shallowCompareArrayOrObject([], [])
    expect(isEqual).toBe(true)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(
      SHALLOW_COMPARE_INVOCATION_TYPE.array
    )
  })

  test('[], {}', (): void => {
    const isEqual = shallowCompareArrayOrObject([], {})
    expect(isEqual).toBe(false)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(null)
  })

  test('{}, []', (): void => {
    const isEqual = shallowCompareArrayOrObject({}, [])
    expect(isEqual).toBe(false)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(null)
  })

  test('{}, {}', (): void => {
    const isEqual = shallowCompareArrayOrObject({}, {})
    expect(isEqual).toBe(true)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(
      SHALLOW_COMPARE_INVOCATION_TYPE.object
    )
  })

})

describe(shallowCompareObject.name, (): void => {

  test('Empty object', (): void => {
    const isEqual = shallowCompareObject({}, {})
    expect(isEqual).toBe(true)
  })

  describe('Different types', (): void => {

    test('undefined, []', (): void => {
      const isEqual = shallowCompareObject(undefined, {})
      expect(isEqual).toBe(false)
    })

    test('number, []', (): void => {
      const isEqual = shallowCompareObject(42, {})
      expect(isEqual).toBe(false)
    })

  })

  test('Different property size', (): void => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size, different property names', (): void => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', c: 42 }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size and names, different values', (): void => {
    const prevState = { a: 'foo', b: 42, c: [] }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size and names, same values', (): void => {
    const ARR = []
    const prevState = { a: 'foo', b: 42, c: ARR }
    const nextState = { a: 'foo', b: 42, c: ARR }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(true)
  })

  test('All same, but arrangement different', (): void => {
    const ARR = []
    const prevState = { a: 'foo', b: 42, c: ARR }
    const nextState = { a: 'foo', c: ARR, b: 42 }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

})

describe(stringifyCompare.name, (): void => {

  test('Empty object', (): void => {
    const isEqual = stringifyCompare({}, {})
    expect(isEqual).toBe(true)
  })

  test('Different property size', (): void => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size, different property names', (): void => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', c: 42 }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size and names, different values', (): void => {
    const prevState = { a: 'foo', b: 42, c: [] }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(true)
  })

  test('Same property size and names, same values', (): void => {
    const ARR = []
    const prevState = { a: 'foo', b: 42, c: ARR }
    const nextState = { a: 'foo', b: 42, c: ARR }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(true)
  })

})
