import { $$createRelinkCore } from '.'

/**
 * A control set to make sure `Object.is` can be relied upon for mutability
 * testing.
 */
describe('Object.is', () => {

  test('Reference comparison', () => {
    const defaultState = { value: 1 }
    const mutablecore = $$createRelinkCore(defaultState, true)
    const immutablecore = $$createRelinkCore(defaultState, false)
    expect(Object.is(mutablecore.M$get(), defaultState)).toBe(true)
    expect(Object.is(immutablecore.M$get(), defaultState)).toBe(false)
  })

  test('Attempt to modify `defaultState`', (): void => {
    const defaultState = { value: 1 }
    const mutablecore = $$createRelinkCore(defaultState, true)
    const immutablecore = $$createRelinkCore(defaultState, false)
    defaultState.value = 2
    expect(mutablecore.M$get()).toStrictEqual({ value: 2 })
    expect(immutablecore.M$get()).toStrictEqual({ value: 1 })
  })

  describe('Attempt to modify `.get()` value', (): void => {

    test('on mutableCore', (): void => {
      const defaultState = { value: 1 }
      const mutablecore = $$createRelinkCore(defaultState, true)
      mutablecore.M$get().value = 2
      expect(mutablecore.M$get()).toStrictEqual({ value: 2 })
    })

    test('on immutableCore', (): void => {
      const defaultState = { value: 1 }
      const immutablecore = $$createRelinkCore(defaultState, false)
      immutablecore.M$get().value = 2
      expect(immutablecore.M$get()).toStrictEqual({ value: 1 })
    })

  })

})
