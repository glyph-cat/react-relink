import { createSuspenseWaiter } from '../../src/suspense-waiter'

it('Pending', () => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 100)
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => {
    wait()
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(callback).toThrow()
      resolve()
    }, 50)
  })
})

it('Completed', () => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 25)
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => {
    wait()
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(callback).not.toThrow()
      resolve()
    }, 50)
  })
})

it('Error', () => {
  const promise = new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject('match-key')
    }, 25)
  })
  const wait = createSuspenseWaiter(promise)
  const callback = () => {
    wait()
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(callback).toThrowError('match-key')
      resolve()
    }, 50)
  })
})
