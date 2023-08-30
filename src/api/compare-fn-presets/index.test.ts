import { RELINK_COMPARE_FN_PRESET } from '.'
import {
  SHALLOW_COMPARE_INVOCATION_SPY,
  SHALLOW_COMPARE_INVOCATION_TYPE,
} from './internals'

const {
  shallowCompareArray,
  shallowCompareArrayOrObject,
  shallowCompareObject,
  stringifyCompare
} = RELINK_COMPARE_FN_PRESET

afterEach(() => {
  SHALLOW_COMPARE_INVOCATION_SPY.current = null
})

describe(shallowCompareArray.name, () => {

  test('Empty array', () => {
    const isEqual = shallowCompareArray([], [])
    expect(isEqual).toBe(true)
  })

  describe('Different types', () => {

    test('undefined, []', () => {
      const isEqual = shallowCompareArray(undefined, [])
      expect(isEqual).toBe(false)
    })

    test('number, []', () => {
      const isEqual = shallowCompareArray(42, [])
      expect(isEqual).toBe(false)
    })

  })

  test('Differrent length', () => {
    const prevState = ['foo', 42]
    const nextState = ['foo', 'bar', 42]
    const isEqual = shallowCompareArray(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same length, different items', () => {
    const prevState = ['foo', {}, 42]
    const nextState = ['foo', {}, 42]
    const isEqual = shallowCompareArray(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same length, same items', () => {
    const OBJ = {}
    const prevState = ['foo', OBJ, 42]
    const nextState = ['foo', OBJ, 42]
    const isEqual = shallowCompareArray(prevState, nextState)
    expect(isEqual).toBe(true)
  })

})

describe(shallowCompareArrayOrObject.name, () => {

  test('[], []', () => {
    const isEqual = shallowCompareArrayOrObject([], [])
    expect(isEqual).toBe(true)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(
      SHALLOW_COMPARE_INVOCATION_TYPE.array
    )
  })

  test('[], {}', () => {
    const isEqual = shallowCompareArrayOrObject([], {})
    expect(isEqual).toBe(false)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(null)
  })

  test('{}, []', () => {
    const isEqual = shallowCompareArrayOrObject({}, [])
    expect(isEqual).toBe(false)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(null)
  })

  test('{}, {}', () => {
    const isEqual = shallowCompareArrayOrObject({}, {})
    expect(isEqual).toBe(true)
    expect(SHALLOW_COMPARE_INVOCATION_SPY.current).toBe(
      SHALLOW_COMPARE_INVOCATION_TYPE.object
    )
  })

})

describe(shallowCompareObject.name, () => {

  test('Empty object', () => {
    const isEqual = shallowCompareObject({}, {})
    expect(isEqual).toBe(true)
  })

  describe('Different types', () => {

    test('undefined, []', () => {
      const isEqual = shallowCompareObject(undefined, {})
      expect(isEqual).toBe(false)
    })

    test('number, []', () => {
      const isEqual = shallowCompareObject(42, {})
      expect(isEqual).toBe(false)
    })

  })

  test('Different property size', () => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size, different property names', () => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', c: 42 }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size and names, different values', () => {
    const prevState = { a: 'foo', b: 42, c: [] }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size and names, same values', () => {
    const ARR = []
    const prevState = { a: 'foo', b: 42, c: ARR }
    const nextState = { a: 'foo', b: 42, c: ARR }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(true)
  })

  test('All same, but arrangement different', () => {
    const ARR = []
    const prevState = { a: 'foo', b: 42, c: ARR }
    const nextState = { a: 'foo', c: ARR, b: 42 }
    const isEqual = shallowCompareObject(prevState, nextState)
    expect(isEqual).toBe(false)
  })

})

describe(stringifyCompare.name, () => {

  test('Empty object', () => {
    const isEqual = stringifyCompare({}, {})
    expect(isEqual).toBe(true)
  })

  test('Different property size', () => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size, different property names', () => {
    const prevState = { a: 'foo', b: 42 }
    const nextState = { a: 'foo', c: 42 }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(false)
  })

  test('Same property size and names, different values', () => {
    const prevState = { a: 'foo', b: 42, c: [] }
    const nextState = { a: 'foo', b: 42, c: [] }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(true)
  })

  test('Same property size and names, same values', () => {
    const ARR = []
    const prevState = { a: 'foo', b: 42, c: ARR }
    const nextState = { a: 'foo', b: 42, c: ARR }
    const isEqual = stringifyCompare(prevState, nextState)
    expect(isEqual).toBe(true)
  })

})
