import { createGatedQueue } from '.'
import { delay, TIME_GAP } from '../../tests/helpers'

describe(createGatedQueue.name, (): void => {

  test('initialStatus = false', async (): Promise<void> => {
    let counter = 0
    const gate = createGatedQueue() // Defaults to false

    // Test if queued callbacks are effective (They should not)
    await gate.M$exec((): void => {
      counter = counter + 1
    })
    await gate.M$exec(async (): Promise<void> => {
      delay(TIME_GAP(1))
      counter = counter + 1
    })
    expect(gate.M$getStatus()).toBe(false)
    expect(counter).toBe(0)

    // Check if queued callbacks are invoked after opening gate
    gate.M$setStatus(true)
    expect(counter).toBe(2)
    expect(gate.M$getStatus()).toBe(true)

    // Check if queued callbacks are directly invoked when gate is already open
    await gate.M$exec((): void => {
      counter = counter + 1
    })
    expect(counter).toBe(3)
    await gate.M$exec(async (): Promise<void> => {
      delay(TIME_GAP(1))
      counter = counter + 1
    })
    expect(counter).toBe(4)
  })

  test('initialStatus = true', async (): Promise<void> => {
    let counter = 0
    const gate = createGatedQueue(true)

    // Check if callbacks are directly invoked when gate is already open
    await gate.M$exec((): void => {
      counter = counter + 1
    })
    await gate.M$exec(async (): Promise<void> => {
      delay(TIME_GAP(1))
      counter = counter + 1
    })
    expect(counter).toBe(2)

    // Check if callbacks are still invoked after gate is closed
    gate.M$setStatus(false)
    await gate.M$exec((): void => {
      counter = counter + 1
    })
    await gate.M$exec((): void => {
      delay(TIME_GAP(1))
      counter = counter + 1
    })
    expect(counter).toBe(2)

    // Check if queued callbacks are invoked when gate is re-opened
    gate.M$setStatus(true)
    expect(counter).toBe(4)
  })

})
