import { UNSTABLE_createSource as createSource } from '../../../src/source'

it('States are carried forward in the batches', () => {
  jest.useFakeTimers()
  const sh = createSource({
    default: { a: 1, b: 1 },
    options: { virtualBatch: true },
  })
  sh.M$set((oldState) => ({ ...oldState, a: oldState.a + 1 }))
  sh.M$set((oldState) => ({ ...oldState, b: oldState.b + 1 }))
  jest.advanceTimersByTime()
  const state = sh.M$get()
  expect(state).toStrictEqual({ a: 2, b: 2 })
})
