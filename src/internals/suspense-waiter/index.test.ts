import { TIME_GAP } from '../../debugging'
import { createSuspenseWaiter } from '../../internals/suspense-waiter'

describe(createSuspenseWaiter.name, (): void => {

  jest.useRealTimers()

  test('Error', () => {
    const promise = new Promise<void>((_resolve, reject): void => {
      reject('match-key')
    })
    const wait = createSuspenseWaiter(promise)
    const callback = (): void => { wait() }
    return new Promise<void>((resolve) => {
      setTimeout((): void => {
        expect(callback).toThrowError('match-key')
        resolve()
      }, TIME_GAP(1))
    })
  })

  test('Pending', (): void => {
    const promise = new Promise<void>((resolve): void => {
      setTimeout((): void => { resolve() }, TIME_GAP(1))
    })
    const wait = createSuspenseWaiter(promise)
    const callback = (): void => { wait() }
    expect(callback).toThrow()
  })

  test('Completed', async () => {
    const promise = new Promise<void>((resolve): void => {
      resolve()
    })
    const wait = createSuspenseWaiter(promise)
    const callback = () => { wait() }
    return new Promise<void>((resolve) => {
      setTimeout((): void => {
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

// describe(performSuspension.name, (): void => {

//   test('Error', () => {
//     const callback = (): void => {
//       const promise = new Promise((_resolve, reject) => {
//         reject('match-key')
//       })
//       performSuspension(promise)
//     }
//     return new Promise<void>((resolve) => {
//       setTimeout((): void => {
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
//     const callback = (): void => { performSuspension(promise) }
//     expect(Object.is(caughtItemFrom(callback), promise)).toBe(true)
//   })

//   test('Completed', async () => {
//     const promise = new Promise<void>((resolve) => {
//       resolve()
//     })
//     const callback = (): void => { performSuspension(promise) }
//     expect(callback).not.toThrow()
//   })

// })
