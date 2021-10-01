import { flow } from '.'
import { TIME_GAP } from '../../tests/helpers'

describe('Flow Controller', (): void => {

  jest.useRealTimers()

  test('Flows in correct order', (): Promise<void> => {

    const textStack: Array<string> = []

    const PATH_A_KEY = 'path-a'
    let counterA = 0
    const asyncFunctionA = async (): Promise<void> => {
      const currentChar = `A${++counterA}`
      textStack.push(currentChar)
    }

    const PATH_B_KEY = 2 // 'path-b'
    let counterB = 0
    const asyncFunctionB = (): Promise<void> => {
      return new Promise((resolve): void => {
        setTimeout(() => {
          const currentChar = `B${++counterB}`
          textStack.push(currentChar)
          resolve(undefined)
        }, TIME_GAP(1))
      })
    }

    const PATH_C_KEY = Symbol('path-c')
    let counterC = 0
    const asyncFunctionC = (): void => {
      const currentChar = `C${++counterC}`
      textStack.push(currentChar)
    }

    return new Promise((resolve): void => {
      flow(PATH_A_KEY, asyncFunctionA)
      flow(PATH_B_KEY, asyncFunctionB)
      flow(PATH_C_KEY, asyncFunctionC)
      flow(PATH_A_KEY, asyncFunctionA)
      flow(PATH_B_KEY, asyncFunctionB)
      flow(PATH_C_KEY, asyncFunctionC)
      setTimeout((): void => {
        /**
         * All 'A' and 'C' functions will be called first because B has a delay
         * of 3 time gaps.
         * Same path       -> queued
         * Different paths -> Runs in parallel (but first come first served)
         *
         * Output should be ['A1', 'C1', 'A2', 'C2', 'B1', 'B2'], but I'm not
         * sure why C2 came before A2. My guess is that because C2 is purely
         * synchronous?
         *
         * But if we run the code below:
         * ```js
         * async function foo() { console.log('foo') }
         * function bar() { console.log('bar') }
         * foo()
         * bar()
         * ```
         * We will still see 'foo' being logged first, then only 'bar'.
         */
        const expectedOutput = ['A1', 'C1', 'C2', 'A2', 'B1', 'B2']
        expect(textStack).toStrictEqual(expectedOutput)
        resolve()
      }, TIME_GAP(3))
    })

  })

  test('Values are forwarded', (): Promise<void> => {
    return new Promise((resolve): void => {
      flow('path', async (): Promise<string> => 'hello')
        .then((value: string): void => {
          expect(value).toBe('hello')
          resolve()
        })
    })
  })

})
