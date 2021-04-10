import { createSource } from '../../../src/source'

it('Source - Add/Remove Listener', () => {

  const sh = createSource({
    default: 1,
  })

  const state = sh.get()
  expect(state).toBe(1)

  // Add listener
  let receivedState = null
  const listenerId = sh.addListener((newState) => {
    receivedState = newState
  })

  // Check for change
  sh.set(2)
  expect(receivedState).toBe(2)

  // Remove listener
  sh.removeListener(listenerId)
  sh.set(3)
  expect(receivedState).toBe(2)

})
