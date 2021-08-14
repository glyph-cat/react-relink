import { createWatcher } from '.'

test('createWatcher', () => {
  const watcher = createWatcher<number>()

  let counter = 0
  const stopWatching = watcher.M$watch((num: number) => { counter += num })

  // Refresh and expect value to be updated
  watcher.M$refresh(1)
  expect(counter).toBe(1)

  // Refresh again and expect value to also be updated
  watcher.M$refresh(2)
  expect(counter).toBe(3)

  // Stop watching and expect value to stay the same as previous checkpoint
  stopWatching()
  watcher.M$refresh(3)
  expect(counter).toBe(3)

})
