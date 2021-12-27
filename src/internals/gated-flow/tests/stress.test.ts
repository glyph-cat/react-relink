import { delay, TIME_GAP } from '../../../debugging'
import { createGatedFlow } from '..'

test('Stress test', async (): Promise<void> => {

  const gateKeeper = createGatedFlow(true, 'test/gated-flow/stress')
  const array: Array<number> = []

  // Stage 1
  gateKeeper.M$exec((): void => { array.push(1) })
  // Expect number to be pushed right away
  expect(array).toStrictEqual([1])

  // Stage 2
  gateKeeper.M$lock()
  expect(array).toStrictEqual([1]) // because locked
  gateKeeper.M$exec(async (): Promise<void> => { array.push(2) })
  expect(array).toStrictEqual([1]) // because locked

  // Stage 3
  gateKeeper.M$open()
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$exec(async (): Promise<void> => {
    await delay(TIME_GAP(1))
    array.push(3)
  })
  expect(array).toStrictEqual([1, 2])

  // NOTE: The idea is to open and lock the gate many times but don't give
  // the callbacks enough time to complete.

  // Stage 4
  gateKeeper.M$exec(async (): Promise<void> => {
    await delay(TIME_GAP(1))
    array.push(4)
  })
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$lock()
  expect(array).toStrictEqual([1, 2])

  // Stage 5
  gateKeeper.M$exec((): void => { array.push(5) })
  expect(array).toStrictEqual([1, 2])
  // Array should still remain the same even though this one is synchronous
  // because there are asynchronous callbacks that are still not complete.
  gateKeeper.M$lock()
  expect(array).toStrictEqual([1, 2])

  // Stage 6
  gateKeeper.M$open()
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$exec(async (): Promise<void> => {
    await delay(TIME_GAP(2))
    array.push(6)
  })
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$exec((): void => { array.push(7) })
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$exec(async (): Promise<void> => {
    await delay(TIME_GAP(2))
    array.push(8)
  })
  expect(array).toStrictEqual([1, 2])

  // Stage 7
  gateKeeper.M$open()
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$exec(async (): Promise<void> => {
    await delay(TIME_GAP(2))
    array.push(9)
  })
  expect(array).toStrictEqual([1, 2])

  // Stage 8
  gateKeeper.M$lock()
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$exec(async (): Promise<void> => {
    await delay(TIME_GAP(2))
    array.push(10)
  })
  expect(array).toStrictEqual([1, 2])

  // Stage 9
  gateKeeper.M$open()
  expect(array).toStrictEqual([1, 2])
  gateKeeper.M$lock()
  expect(array).toStrictEqual([1, 2])

  // Stage 10
  await gateKeeper.M$open()
  expect(array).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

})
