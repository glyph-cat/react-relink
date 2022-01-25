import { createRelinkCore } from '.'

/**
 * A control set to make sure `Object.is` can be relied upon for mutability
 * testing.
 */
describe('Object.is', (): void => {

  test('Reference comparison', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = createRelinkCore(defaultState)
    expect(Object.is(mutablecore.M$get(), defaultState)).toBe(true)
  })

  test('Attempt to modify `defaultState`', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = createRelinkCore(defaultState)
    defaultState.value = 2
    expect(mutablecore.M$get()).toStrictEqual({ value: 2 })
  })

  test('Attempt to modify `.get()` value', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = createRelinkCore(defaultState)
    mutablecore.M$get().value = 2
    expect(mutablecore.M$get()).toStrictEqual({ value: 2 })
  })

})
