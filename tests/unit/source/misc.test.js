import { createSource } from '../../../src/source'

it('States are carried forward in the batches', () => {
  jest.useFakeTimers()
  const sh = createSource({
    default: { a: 1, b: 1 },
    options: { virtualBatch: true },
  })
  sh.set((oldState) => ({ ...oldState, a: oldState.a + 1 }))
  sh.set((oldState) => ({ ...oldState, b: oldState.b + 1 }))
  jest.advanceTimersByTime()
  const state = sh.get()
  expect(state).toStrictEqual({ a: 2, b: 2 })
})
