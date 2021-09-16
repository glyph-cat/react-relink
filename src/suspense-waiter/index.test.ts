import { createSuspenseWaiter } from '../../src/suspense-waiter'
import { TIME_GAP } from '../../tests/helpers'

test('Pending', (): Promise<void> => {
  const promise: Promise<void> = new Promise((resolve) => {
    setTimeout((): void => { resolve() }, TIME_GAP(2))
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => { wait() }
  return new Promise((resolve) => {
    setTimeout((): void => {
      expect(callback).toThrow()
      resolve()
    }, TIME_GAP(1))
  })
})

test('Completed', (): Promise<void> => {
  const promise: Promise<void> = new Promise((resolve) => {
    setTimeout((): void => { resolve() }, TIME_GAP(1))
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => { wait() }
  return new Promise((resolve) => {
    setTimeout((): void => {
      expect(callback).not.toThrow()
      resolve()
    }, TIME_GAP(2))
  })
})

test('Error', (): Promise<void> => {
  const promise: Promise<void> = new Promise((_resolve, reject) => {
    setTimeout((): void => { reject('match-key') }, TIME_GAP(1))
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => { wait() }
  return new Promise((resolve) => {
    setTimeout((): void => {
      expect(callback).toThrowError('match-key')
      resolve()
    }, TIME_GAP(2))
  })
})
