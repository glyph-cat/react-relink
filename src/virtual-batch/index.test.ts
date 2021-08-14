import { createBrowserBatcher, createServerBatcher } from '.'

describe('Virtual batch', () => {

  test('createBrowserBatcher', () => {
    jest.useFakeTimers()
    const batch = createBrowserBatcher()
    const spyFn = jest.fn()
    batch(spyFn)
    batch(spyFn)
    batch(spyFn)
    expect(spyFn).toBeCalledTimes(0)
    jest.advanceTimersByTime(10)
    expect(spyFn).toBeCalledTimes(3)
  })

  test('createServerBatcher', () => {
    const batch = createServerBatcher()
    const spyFn = jest.fn()
    batch(spyFn)
    batch(spyFn)
    batch(spyFn)
    expect(spyFn).toBeCalledTimes(3)
    // NOTE: Callbacks will be fired right way in server
  })

})
