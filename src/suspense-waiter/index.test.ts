import { createSuspenseWaiter } from '../../src/suspense-waiter'
import { TIME_GAP } from '../../tests/helpers'

describe(createSuspenseWaiter.name, (): void => {

  jest.useRealTimers()

  test('Pending', (): Promise<void> => {
    const promise: Promise<void> = new Promise((resolve): void => {
      setTimeout((): void => { resolve() }, TIME_GAP(2))
    })
    const wait = createSuspenseWaiter(promise)
    const callback = (): void => { wait() }
    return new Promise((resolve): void => {
      setTimeout((): void => {
        expect(callback).toThrow()
        resolve()
      }, TIME_GAP(1))
    })
  })

  test('Completed', (): Promise<void> => {
    const promise: Promise<void> = new Promise((resolve): void => {
      setTimeout((): void => { resolve() }, TIME_GAP(1))
    })
    const wait = createSuspenseWaiter(promise)
    const callback = (): void => { wait() }
    return new Promise((resolve): void => {
      setTimeout((): void => {
        expect(callback).not.toThrow()
        resolve()
      }, TIME_GAP(2))
    })
  })

  test('Error', (): Promise<void> => {
    const promise: Promise<void> = new Promise((_resolve, reject): void => {
      setTimeout((): void => { reject('match-key') }, TIME_GAP(1))
    })
    const wait = createSuspenseWaiter(promise)
    const callback = (): void => { wait() }
    return new Promise((resolve): void => {
      setTimeout((): void => {
        expect(callback).toThrowError('match-key')
        resolve()
      }, TIME_GAP(2))
    })
  })

})
