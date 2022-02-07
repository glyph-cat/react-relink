import { RelinkSourceSchema } from '../../../src/schema'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure subsequent reducers are executed even if there are errors or
//   unhandled promise rejection halfway through.

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  describe('Error handling in reducers', (): void => {

    jest.setTimeout(10100)

    let Source: RelinkSourceSchema<number>
    beforeEach((): void => {
      Source = createSource({
        key: 'test/error-handling-in-reducers',
        default: 0,
      })
    })
    afterEach((): void => {
      Source.cleanup()
    })

    class CustomError extends Error { }

    test('Synchronous reducers', async (): Promise<void> => {

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

    test('Asynchronous reducers', async (): Promise<void> => {

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

    test('Promises', async (): Promise<void> => {

      // Normal sync and async set
      Source.set((c) => { return c + 1 })
      Source.set(async (c) => { return c + 1 })

      // Simulate an error
      let caughtError: Error
      try {
        await Source.set(() => new Promise(((_resolve, reject) => {
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
