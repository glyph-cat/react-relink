import { isEqual } from '.'

describe('isEqual', (): void => {

  describe('mutable=true', (): void => {

    const MUTABLE_TRUE = true

    test('Should evaluate to true', (): void => {
      expect(isEqual(42, 42, MUTABLE_TRUE)).toBe(true)
      const objA = {}, objB = objA
      expect(isEqual(objA, objB, MUTABLE_TRUE)).toBe(true)
    })

    test('Should evaluate to false', (): void => {
      expect(isEqual(42, 41, MUTABLE_TRUE)).toBe(false)
      const objA = {}, objB = {}
      expect(isEqual(objA, objB, MUTABLE_TRUE)).toBe(false)
    })

  })

  describe('mutable=false', (): void => {

    const MUTABLE_FALSE = false

    test('Should evaluate to true', (): void => {
      expect(isEqual(42, 42, MUTABLE_FALSE)).toBe(true)
      const objA = {}, objB = {}
      expect(isEqual(objA, objB, MUTABLE_FALSE)).toBe(true)
    })

    test('Should evaluate to false', (): void => {
      expect(isEqual(42, 41, MUTABLE_FALSE)).toBe(false)
      const objA = {}, objB = { foo: 'bar' }
      expect(isEqual(objA, objB, MUTABLE_FALSE)).toBe(false)
    })

  })

})
