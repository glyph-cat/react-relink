import { delay } from '@glyph-cat/swiss-army-knife'
import { TIME_GAP } from '../../../debugging'
import { GatedFlow } from '..'

// Elaboration: Gate only closes when all currently queued callbacks have been
// flushed, but callbacks placed after a lock is requested remains queued.
test('Gate closes at appropriate timing', async () => {
  const gateKeeper = new GatedFlow(true, 'test/gated-flow/close-timing')
  const array: Array<string> = []

  // Execute first group of callbacks
  gateKeeper.M$exec((): void => {
    array.push('group-1,item-1')
  })
  gateKeeper.M$exec(async () => {
    await delay(TIME_GAP(1))
    array.push('group-1,item-2')
  })
  gateKeeper.M$exec(async () => {
    array.push('group-1,item-3')
  })
  gateKeeper.M$exec((): void => {
    array.push('group-1,item-4')
  })
  gateKeeper.M$exec(async () => {
    await delay(TIME_GAP(1))
    array.push('group-1,item-5')
  })

  const group1CallbacksToComplete = gateKeeper.M$exec((): void => {
    // Just waiting for group-1 callbacks to complete...
  })

  // Close gate before all callbacks in the first group are able to complete.
  // At this point, we can only anticipate that a few out of the 5 have been
  // completed.
  gateKeeper.M$lock()

  // Then, execute the second group of callbacks
  gateKeeper.M$exec((): void => {
    array.push('group-2,item-1')
  })
  gateKeeper.M$exec(async () => {
    array.push('group-2,item-2')
  })

  await group1CallbacksToComplete
  expect(array).toStrictEqual([
    'group-1,item-1',
    'group-1,item-2',
    'group-1,item-3',
    'group-1,item-4',
    'group-1,item-5',
  ])

})
