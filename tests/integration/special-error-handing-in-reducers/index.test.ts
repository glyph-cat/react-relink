import type { RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure subsequent reducers are executed even if there are errors or
//   unhandled promise rejection halfway through.

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  describe('Error handling in reducers', () => {

    let Source: RelinkSource<number>
    beforeEach(() => {
      Source = new RelinkSource({
        key: 'test/error-handling-in-reducers',
        default: 0,
      })
    })
    afterEach(async () => {
      await Source.dispose()
    })

    class CustomError extends Error { }

    test('Synchronous reducers', async () => {

      // Normal sync and async set
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Simulate an error
      let caughtError: Error
      try {
        await Source.set(() => { throw new CustomError() })
      } catch (e) {
        caughtError = e
      }
      expect(caughtError instanceof CustomError).toBe(true)

      // Normal sync and async set (again)
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Check state
      expect(await Source.getAsync()).toBe(4)

    })

    test('Asynchronous reducers', async () => {

      // Normal sync and async set
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Simulate an error
      let caughtError: Error
      try {
        await Source.set(async () => { throw new CustomError() })
      } catch (e) {
        caughtError = e
      }
      expect(caughtError instanceof CustomError).toBe(true)

      // Normal sync and async set (again)
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Check state
      expect(await Source.getAsync()).toBe(4)

    })

    test('Promises', async () => {

      // Normal sync and async set
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Simulate an error
      let caughtError: Error
      try {
        await Source.set(() => new Promise<number>(((_resolve, reject) => {
          reject(new CustomError())
        })))
      } catch (e) {
        caughtError = e
      }
      expect(caughtError instanceof CustomError).toBe(true)

      // Normal sync and async set (again)
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Check state
      expect(await Source.getAsync()).toBe(4)

    })

  })

})
