import { TIME_GAP } from '../../../debugging-utils'
import { createSuspenseWaiter } from '../../internals/suspense-waiter'

describe(createSuspenseWaiter.name, () => {

  jest.useRealTimers()

  test('Error', () => {
    const promise = new Promise<void>((_resolve, reject) => {
      reject('match-key')
    })
    const wait = createSuspenseWaiter(promise)
    const callback = () => { wait() }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(callback).toThrowError('match-key')
        resolve()
      }, TIME_GAP(1))
    })
  })

  test('Pending', () => {
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => { resolve() }, TIME_GAP(1))
    })
    const wait = createSuspenseWaiter(promise)
    const callback = () => { wait() }
    expect(callback).toThrow()
  })

  test('Completed', async () => {
    const promise = new Promise<void>((resolve) => {
      resolve()
    })
    const wait = createSuspenseWaiter(promise)
    const callback = () => { wait() }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(callback).not.toThrow()
        resolve()
      }, TIME_GAP(1))
    })
  })

})

// // eslint-disable-next-line @typescript-eslint/ban-types
// function caughtItemFrom(callback: Function): unknown {
//   try {
//     callback()
//     throw new Error('Callback did not throw')
//   } catch (caughtItem) {
//     return caughtItem
//   }
// }

// describe(performSuspension.name, () => {

//   test('Error', () => {
//     const callback = () => {
//       const promise = new Promise((_resolve, reject) => {
//         reject('match-key')
//       })
//       performSuspension(promise)
//     }
//     return new Promise<void>((resolve) => {
//       setTimeout(() => {
//         expect(callback).toThrow('match-key')
//         resolve()
//       }, TIME_GAP(1))
//     })
//   })

//   test('Pending', async () => {
//     const promise = new Promise<void>((resolve) => {
//       setTimeout(() => {
//         resolve()
//       }, TIME_GAP(1))
//     })
//     // console.log(promise) // Promise { <pending> }
//     const callback = () => { performSuspension(promise) }
//     expect(Object.is(caughtItemFrom(callback), promise)).toBe(true)
//   })

//   test('Completed', async () => {
//     const promise = new Promise<void>((resolve) => {
//       resolve()
//     })
//     const callback = () => { performSuspension(promise) }
//     expect(callback).not.toThrow()
//   })

// })
