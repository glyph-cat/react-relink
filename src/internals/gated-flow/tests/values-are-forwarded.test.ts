import { createGatedFlow } from '..'

test('Synchronous', async (): Promise<void> => {
  const gateKeeper = createGatedFlow(true, 'test/gated-flow/values-are-forwarded/synchronous')
  const obj = Symbol()
  const payload = await gateKeeper.M$exec((): symbol => {
    return obj
  })
  expect(Object.is(payload, obj)).toBe(true)
})

test('Asynchronous', async (): Promise<void> => {
  const gateKeeper = createGatedFlow(true, 'test/gated-flow/values-are-forwarded/asynchronous')
  const obj = Symbol()
  const payload = await gateKeeper.M$exec(async (): Promise<symbol> => {
    return obj
  })
  expect(Object.is(payload, obj)).toBe(true)
})
