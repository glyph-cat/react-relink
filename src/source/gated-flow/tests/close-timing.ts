import { delay, TIME_GAP } from '../../../../tests/helpers'
import { createGatedFlow } from '..'

describe(createGatedFlow.name, (): void => {

  // Elaboration: Gate only closes when all currently queued callbacks have been
  // flushed, but callbacks placed after a lock is requested remains queued.
  test('Gate closes at appropriate timing', async (): Promise<void> => {
    jest.useRealTimers()
    const gateKeeper = createGatedFlow(true)
    const array: Array<string> = []

    // Execute first group of callbacks
    gateKeeper.M$exec((): void => {
      array.push('group-1,item-1')
    })
    gateKeeper.M$exec(async (): Promise<void> => {
      await delay(TIME_GAP(1))
      array.push('group-1,item-2')
    })
    gateKeeper.M$exec(async (): Promise<void> => {
      array.push('group-1,item-3')
    })
    gateKeeper.M$exec((): void => {
      array.push('group-1,item-4')
    })
    gateKeeper.M$exec(async (): Promise<void> => {
      await delay(TIME_GAP(1))
      array.push('group-1,item-5')
    })

    // Close gate before all callbacks in the first group are able to complete.
    // At this point, we can only anticipate that a few out of the 5 have been
    // completed.
    gateKeeper.M$lock()

    // Then, execute the second group of callbacks
    gateKeeper.M$exec((): void => {
      array.push('group-2,item-1')
    })
    gateKeeper.M$exec(async (): Promise<void> => {
      array.push('group-2,item-2')
    })

    // First group of callbacks are estimated to take 2 time gaps to complete.
    // We give extra time padding by waiting for 3 time gaps. At this point, we
    // expect the first group to have completed. Data from second group should
    // not appear in the array because a request to close the gate has been made
    // before they were added to the queue.
    await delay(TIME_GAP(3))
    expect(array).toStrictEqual([
      'group-1,item-1',
      'group-1,item-2',
      'group-1,item-3',
      'group-1,item-4',
      'group-1,item-5',
    ])

  })

})
