import { createGatedFlow } from '..'

test('Synchronous', async (): Promise<void> => {
  const gateKeeper = createGatedFlow(true)
  const obj = Symbol()
  const payload = await gateKeeper.M$exec((): symbol => {
    return obj
  })
  expect(Object.is(payload, obj)).toBe(true)
})

test('Aynchronous', async (): Promise<void> => {
  const gateKeeper = createGatedFlow(true)
  const obj = Symbol()
  const payload = await gateKeeper.M$exec(async (): Promise<symbol> => {
    return obj
  })
  expect(Object.is(payload, obj)).toBe(true)
})
