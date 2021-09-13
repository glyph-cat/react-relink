import { createSuspenseWaiter } from '../../src/suspense-waiter'

enum WAIT_TIME {
  min = 25,
  mid = 50,
  max = 100,
}

test('Pending', (): Promise<void> => {
  const promise: Promise<void> = new Promise((resolve) => {
    setTimeout(() => { resolve() }, WAIT_TIME.max)
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => { wait() }
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(callback).toThrow()
      resolve()
    }, WAIT_TIME.mid)
  })
})

test('Completed', (): Promise<void> => {
  const promise: Promise<void> = new Promise((resolve) => {
    setTimeout(() => { resolve() }, WAIT_TIME.min)
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => { wait() }
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(callback).not.toThrow()
      resolve()
    }, WAIT_TIME.mid)
  })
})

test('Error', (): Promise<void> => {
  const promise: Promise<void> = new Promise((_resolve, reject) => {
    setTimeout(() => { reject('match-key') }, WAIT_TIME.min)
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => { wait() }
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(callback).toThrowError('match-key')
      resolve()
    }, WAIT_TIME.mid)
  })
})
