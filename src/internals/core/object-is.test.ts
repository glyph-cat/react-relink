import { RelinkCore } from '.'

/**
 * A proof of concept to make sure `Object.is` can be relied upon for mutability
 * testing.
 */
describe('Object.is', () => {

  test('Reference comparison', () => {
    const defaultState = { value: 1 }
    const mutablecore = new RelinkCore(defaultState)
    expect(Object.is(mutablecore.M$currentState, defaultState)).toBe(true)
  })

  test('Attempt to modify `defaultState`', () => {
    const defaultState = { value: 1 }
    const mutablecore = new RelinkCore(defaultState)
    defaultState.value = 2
    expect(mutablecore.M$currentState).toStrictEqual({ value: 2 })
  })

  test('Attempt to modify `.get()` value', () => {
    const defaultState = { value: 1 }
    const mutablecore = new RelinkCore(defaultState)
    mutablecore.M$currentState.value = 2
    expect(mutablecore.M$currentState).toStrictEqual({ value: 2 })
  })

})
