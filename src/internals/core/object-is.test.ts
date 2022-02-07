import { RelinkCore } from '.'

/**
 * A control set to make sure `Object.is` can be relied upon for mutability
 * testing.
 */
describe('Object.is', (): void => {

  test('Reference comparison', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = new RelinkCore(defaultState)
    expect(Object.is(mutablecore.M$currentState, defaultState)).toBe(true)
  })

  test('Attempt to modify `defaultState`', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = new RelinkCore(defaultState)
    defaultState.value = 2
    expect(mutablecore.M$currentState).toStrictEqual({ value: 2 })
  })

  test('Attempt to modify `.get()` value', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = new RelinkCore(defaultState)
    mutablecore.M$currentState.value = 2
    expect(mutablecore.M$currentState).toStrictEqual({ value: 2 })
  })

})
