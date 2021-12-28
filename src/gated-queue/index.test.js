import { createGatedQueue } from '.'

describe('createGatedQueue', () => {
  it('initialStatus = false', () => {
    let counter = 0
    const gate = createGatedQueue() // Defaults to false

    // Test if queued callback is effective
    gate.M$exec(() => {
      counter = counter + 1
    })
    expect(gate.M$getStatus()).toBe(false)
    expect(counter).toBe(0)

    // Check if queued callback is invoked after opening gate
    gate.M$setStatus(true)
    expect(counter).toBe(1)
    expect(gate.M$getStatus()).toBe(true)

    // Check if callback is directly invoked when gate is already open
    gate.M$exec(() => {
      counter = counter + 1
    })
    expect(counter).toBe(2)
  })

  it('initialStatus = true', () => {
    let counter = 0
    const gate = createGatedQueue(true)

    // Check if callback is directly invoked when gate is already open
    gate.M$exec(() => {
      counter = counter + 1
    })
    expect(counter).toBe(1)

    // Check if callback is still invoked after gate is closed
    gate.M$setStatus(false)
    gate.M$exec(() => {
      counter = counter + 1
    })
    expect(counter).toBe(1)

    // Check if callback is invoked when gate is re-opened
    gate.M$setStatus(true)
    expect(counter).toBe(2)
  })
})
