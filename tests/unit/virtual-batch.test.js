import virtualBatch from '../../src/virtual-batch'

it('Callbacks are batched', () => {

  jest.useFakeTimers()
  let debouncedExecuteCount = 0
  let debounceRef = null

  const debouncedCallback = jest.fn(() => {
    clearTimeout(debounceRef)
    debounceRef = setTimeout(() => {
      debouncedExecuteCount += 1
    })
  })

  virtualBatch(debouncedCallback)
  virtualBatch(debouncedCallback)
  jest.advanceTimersByTime(10)

  expect(debouncedCallback).toBeCalledTimes(2)
  expect(debouncedExecuteCount).toBe(1)
})

it('Callbacks are called in First-in, First-out order', () => {
  jest.useFakeTimers()
  const normalStack = [],
    batchedStack = []
  for (let i = 0; i < 10; i++) {
    normalStack.push(i)
    virtualBatch(() => {
      batchedStack.push(i)
    })
  }
  jest.advanceTimersByTime()
  expect(batchedStack).toStrictEqual(normalStack)
})
